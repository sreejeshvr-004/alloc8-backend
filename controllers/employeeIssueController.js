import Asset from "../models/assetModel.js";
import AssetHistory from "../models/assetHistoryModel.js";

// @desc    Employee reports issue on assigned asset
// @route   POST /api/employee/assets/:id/report-issue
// @access  Employee
export const reportAssetIssue = async (req, res) => {
  try {
    const { issue, notes } = req.body;
    const assetId = req.params.id;

    const asset = await Asset.findById(assetId);

    if (!asset || asset.isDeleted) {
      return res.status(404).json({ message: "Asset not found" });
    }

    // 🔐 Ensure asset belongs to employee
    if (!asset.assignedTo || asset.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized for this asset" });
    }

    // 🚫 Already in maintenance
    if (asset.status === "maintenance") {
      return res.status(400).json({ message: "Asset already under maintenance" });
    }

// Mark asset as issue reported (NO maintenance here)
asset.status = "issue_reported";

asset.issue = {
  type: issue,
  description: notes,
  reportedBy: req.user._id,
  reportedAt: new Date(),
};

asset.status = "issue_reported";
await asset.save();


// await asset.save();

// History
await AssetHistory.create({
  asset: asset._id,
  action: "issue_reported",
  performedBy: req.user._id,
  notes: issue || "Issue reported by employee",
});


    await asset.save();

    // History
    await AssetHistory.create({
      asset: asset._id,
      action: "maintenance_started",
      performedBy: req.user._id,
      notes: issue || "Issue reported by employee",
    });

    res.json({ message: "Issue reported successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
