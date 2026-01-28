import AssetReturn from "../models/assetReturnModel.js";
import Asset from "../models/assetModel.js";
import AssetHistory from "../models/assetHistoryModel.js";
import { logAudit } from "../utils/auditLogger.js";

/*
  EMPLOYEE — REQUEST ASSET RETURN
  POST /api/returns
*/
export const requestReturn = async (req, res) => {
  try {
    const { assetId, reason } = req.body;

    // Ensure asset is assigned to this employee
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

    // Prevent duplicate return requests
    if (asset.status === "return_requested") {
      return res.status(400).json({
        message: "Return already requested for this asset",
      });
    }

    // Create return request record (informational only)
    const returnRequest = await AssetReturn.create({
      asset: asset._id,
      requestedBy: req.user._id,
      reason: reason || "",
    });

    // Mark asset as return requested (signal to admin)
    asset.status = "return_requested";
    await asset.save();

    // History entry — informational (NOT unassigned)
    await AssetHistory.create({
      asset: asset._id,
      action: "issue_reported", // reused attention-type action
      performedBy: req.user._id,
      notes: `Return requested by ${req.user.name}`,
    });

    // Audit log (system-level)
    await logAudit({
      entityType: "ASSET",
      entityId: asset._id,
      action: "ASSET_RETURN_REQUESTED",
      performedBy: req.user._id,
      details: {
        assetName: asset.name,
        serialNumber: asset.serialNumber,
      },
    });

    res.status(201).json(returnRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/*
  ADMIN — GET ALL RETURN REQUESTS (INFORMATIONAL)
  GET /api/returns
*/
export const getAllReturnRequests = async (req, res) => {
  try {
    const returns = await AssetReturn.find()
      .populate("asset", "name serialNumber status")
      .populate("requestedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(returns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
