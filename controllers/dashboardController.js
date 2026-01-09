import Asset from "../models/assetModel.js";
import Request from "../models/requestModel.js";

export const getDashboardStats = async (req, res) => {
  try {
    // ASSET COUNTS
    const totalAssets = await Asset.countDocuments({ isDeleted: false });

    const assignedAssets = await Asset.countDocuments({
      status: "assigned",
      isDeleted: false,
    });

    const availableAssets = await Asset.countDocuments({
      status: "available",
      isDeleted: false,
    });

    const maintenanceAssets = await Asset.countDocuments({
      status: "maintenance",
      isDeleted: false,
    });

    const faultyAssets = await Asset.countDocuments({
      status: "replaced",
      isDeleted: false,
    });

    // REQUEST COUNTS
    const totalRequests = await Request.countDocuments();

    const pendingRequests = await Request.countDocuments({
      status: "pending",
    });

    const approvedRequests = await Request.countDocuments({
      status: "approved",
    });

    const rejectedRequests = await Request.countDocuments({
      status: "rejected",
    });

    res.json({
      totalAssets,
      assignedAssets,
      availableAssets,
      maintenanceAssets,
      faultyAssets,
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
