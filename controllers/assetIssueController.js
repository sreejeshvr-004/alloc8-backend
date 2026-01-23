import AssetIssue from "../models/assetIssueModel.js";
import Asset from "../models/assetModel.js";
import AssetHistory from "../models/assetHistoryModel.js";
import { logAudit } from "../utils/auditLogger.js";

/* 
   EMPLOYEE — REPORT ISSUE
   POST /api/issues
 */
export const reportIssue = async (req, res) => {
  try {
    const { assetId, issueType, description } = req.body;

    const asset = await Asset.findOne({
      _id: assetId,
      assignedTo: req.user._id,
      isDeleted: false,
    });

    if (!asset) {
      return res.status(403).json({
        message: "You are not assigned to this asset",
      });
    }

    const issue = await AssetIssue.create({
      asset: assetId,
      reportedBy: req.user._id,
      issueType,
      description,
    });

    await logAudit({
      entityType: "ASSET",
      entityId: asset._id,
      action: "issue_reported",
      performedBy: req.user._id,
      details: {
        issueType,
        assetName: asset.name,
      },
    });

    // 🔒 Move asset into quarantine state
    asset.status = "issue_reported";
    await asset.save();

    // Log asset history
    await AssetHistory.create({
      asset: asset._id,
      action: "issue_reported",
      performedBy: req.user._id,
      notes: description || "Issue reported by employee",
    });

    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 
   ADMIN — GET ALL ISSUES
   GET /api/issues
 */
export const getAllIssues = async (req, res) => {
  try {
    const issues = await AssetIssue.find()
      .populate("asset", "name serialNumber status")
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 
   ADMIN — START MAINTENANCE
   PUT /api/issues/:id/start
 */
export const startMaintenance = async (req, res) => {
  try {
    const { vendor, adminNotes } = req.body;

    const issue = await AssetIssue.findById(req.params.id).populate("asset");
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    if (issue.status !== "open") {
      return res.status(400).json({
        message: "Maintenance can only be started for reported issues",
      });
    }

    issue.status = "in_maintenance";
    issue.adminNotes = adminNotes;
    issue.maintenance.startDate = new Date();
    issue.maintenance.vendor = vendor;

    await issue.save();

    issue.asset.status = "maintenance";
    issue.asset.assignedTo = null;
    await issue.asset.save();

    await AssetHistory.create({
      asset: issue.asset._id,
      action: "maintenance_started",
      performedBy: req.user._id,
      notes: adminNotes || "Maintenance started via issue",
    });

    res.json({ message: "Maintenance started" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 
   ADMIN — COMPLETE MAINTENANCE
   PUT /api/issues/:id/complete
 */
export const completeMaintenance = async (req, res) => {
  try {
    const { cost, adminNotes } = req.body;
    const numericCost = Number(cost) || 0;

    const issue = await AssetIssue.findById(req.params.id).populate("asset");

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    if (issue.status !== "in_maintenance") {
      return res.status(400).json({
        message: "Maintenance not started for this issue",
      });
    }

    issue.asset.maintenance.push({
      issue: issue.issueType || "Maintenance",
      cost: numericCost,
      startDate: issue.maintenance.startDate,
      endDate: issue.maintenance.endDate,
      notes: adminNotes,
      isActive: false,
    });

    issue.status = "resolved";
    issue.adminNotes = adminNotes;
    issue.maintenance.endDate = new Date();
    issue.maintenance.cost = cost || 0;

    await issue.save();


    issue.asset.status = "available";
   await Asset.updateOne(
  { _id: issue.asset._id },
  {
    $inc: {
      totalMaintenanceCost: numericCost,
      maintenanceCount: 1,
    },
    $set: {
      status: "available",
    },
    $push: {
      maintenance: {
        issue: issue.issueType || "Maintenance",
        cost: numericCost,
        startDate: issue.maintenance.startDate,
        endDate: new Date(),
        notes: adminNotes,
        isActive: false,
      },
    },
  }
);


    await AssetHistory.create({
      asset: issue.asset._id,
      action: "maintenance_completed",
      performedBy: req.user._id,
      notes: adminNotes || "Maintenance completed",
    });

    res.json({ message: "Maintenance completed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
