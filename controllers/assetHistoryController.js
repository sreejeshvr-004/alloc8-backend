import Asset from "../models/assetModel.js";
import AssetHistory from "../models/assetHistoryModel.js";


// @desc    Get full history of an asset
// @route   GET /api/assets/:id/history
// @access  Admin
export const getAssetHistory = async (req, res) => {
  try {
    const assetId = req.params.id;

    // 1️⃣ Validate asset exists
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    // 2️⃣ Fetch history from SEPARATE collection
    const history = await AssetHistory.find({ asset: assetId })
      .populate("performedBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    // 3️⃣ Return clean response
    res.json({
      asset: {
        id: asset._id,
        name: asset.name,
        category: asset.category,
        serialNumber: asset.serialNumber,
        status: asset.status,
      },
      history,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
