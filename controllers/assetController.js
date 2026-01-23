import Asset from "../models/assetModel.js";
import AssetHistory from "../models/assetHistoryModel.js";
import { logAudit } from "../utils/auditLogger.js";
import User from "../models/userModel.js";

/* -------------------------------- HELPERS -------------------------------- */

const handleError = (res, error) => {
  console.error(error);
  res.status(500).json({ message: error.message });
};

const findActiveAssetById = async (id) => {
  const asset = await Asset.findById(id);
  if (!asset || asset.isDeleted) return null;
  return asset;
};

/* -------------------------------- CONTROLLERS -------------------------------- */

// GET /api/assets
export const getAssets = async (req, res) => {
  try {
    const assets = await Asset.find()
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.json(assets);
  } catch (error) {
    handleError(res, error);
  }
};

// POST /api/assets
export const createAsset = async (req, res) => {
  try {
    const asset = await Asset.create(req.body);

    await logAudit({
      entityType: "ASSET",
      entityId: asset._id,
      action: "ASSET_CREATED",
      performedBy: req.user?._id,
      details: {
        name: asset.name,
        category: asset.category,
      },
    });

    await AssetHistory.create({
      asset: asset._id,
      action: "created",
      performedBy: req.user?._id,
      notes: "Asset created",
    });

    res.status(201).json(asset);
  } catch (error) {
    handleError(res, error);
  }
};

// PUT /api/assets/:id
export const updateAsset = async (req, res) => {
  try {
    const asset = await findActiveAssetById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    Object.assign(asset, req.body);
    await asset.save();

    res.json({ message: "Asset updated successfully" });
  } catch (error) {
    handleError(res, error);
  }
};

// DELETE /api/assets/:id (soft delete)
export const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    asset.isDeleted = true;
    asset.status = "inactive";
    asset.assignedTo = null;
    await asset.save();

    await AssetHistory.create({
      asset: asset._id,
      action: "deactivated",
      performedBy: req.user?._id,
      notes: "Asset deactivated by admin",
    });

    res.json({ message: "Asset deleted (soft delete)" });
  } catch (error) {
    handleError(res, error);
  }
};

// ASSIGN
export const assignAsset = async (req, res) => {
  try {
    const { userId } = req.body;

    const asset = await findActiveAssetById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    if (asset.status === "inactive") {
      return res
        .status(400)
        .json({ message: "Inactive assets cannot be assigned" });
    }

    if (asset.status === "assigned") {
      return res.status(400).json({ message: "Asset already assigned" });
    }

    const user = await User.findById(userId);

    asset.assignedTo = userId;
    asset.status = "assigned";
    await asset.save();

    await AssetHistory.create({
      asset: asset._id,
      action: "assigned",
      performedBy: req.user._id,
      assignedTo: userId,
      notes: "Asset assigned by admin",
    });

    await logAudit({
      entityType: "ASSET",
      entityId: asset._id,
      action: "ASSET_ASSIGNED",
      performedBy: req.user._id,
      details: {
        assetName: asset.name,
        assetSerial: asset.serialNumber,
        assignedToId: user._id,
        assignedToName: user.name,
        assignedToDepartment: user.department,
      },
    });

    res.json({ message: "Asset assigned successfully" });
  } catch (error) {
    handleError(res, error);
  }
};

// UNASSIGN
export const unassignAsset = async (req, res) => {
  try {
    const asset = await findActiveAssetById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    if (asset.status !== "assigned") {
      return res.status(400).json({ message: "Asset is not assigned" });
    }

    const previousUser = asset.assignedTo;

    asset.assignedTo = null;
    asset.status = "available";
    await asset.save();

    await AssetHistory.create({
      asset: asset._id,
      action: "unassigned",
      performedBy: req.user._id,
      assignedTo: previousUser,
      notes: "Asset unassigned by admin",
    });

    await logAudit({
      entityType: "ASSET",
      entityId: asset._id,
      action: "ASSET_UNASSIGNED",
      performedBy: req.user._id,
      details: {
        assetName: asset.name,
        assetSerial: asset.serialNumber,
        previousUserId: previousUser,
      },
    });

    res.json({ message: "Asset unassigned successfully" });
  } catch (error) {
    handleError(res, error);
  }
};

// START MAINTENANCE
export const startMaintenance = async (req, res) => {
  try {
    const { reason, notes, estimatedCost } = req.body;

    const asset = await findActiveAssetById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const activeMaintenance = asset.maintenance.find((m) => m.isActive);
    if (activeMaintenance) {
      return res
        .status(400)
        .json({ message: "Active maintenance already exists" });
    }

    asset.assignedTo = null;
    asset.status = "maintenance";

    asset.maintenance.push({
      issue: reason,
      notes,
      cost: isNaN(Number(estimatedCost)) ? 0 : Number(estimatedCost),
      startDate: new Date(),
      isActive: true,
    });

    await asset.save();

    await AssetHistory.create({
      asset: asset._id,
      action: "maintenance_started",
      performedBy: req.user._id,
      notes: reason || "Maintenance started",
    });

    await logAudit({
      entityType: "MAINTENANCE",
      entityId: asset._id,
      action: "MAINTENANCE_STARTED",
      performedBy: req.user._id,
      details: {
        assetName: asset.name,
        assetSerial: asset.serialNumber,
        estimatedCost: isNaN(Number(estimatedCost)) ? 0 : Number(estimatedCost),
        reason,
      },
    });

    res.json({ message: "Asset sent for maintenance" });
  } catch (error) {
    handleError(res, error);
  }
};

// COMPLETE MAINTENANCE
export const completeMaintenance = async (req, res) => {
  try {
    const { cost } = req.body;

    const asset = await findActiveAssetById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const activeMaintenance = asset.maintenance.find((m) => m.isActive);
    if (!activeMaintenance) {
      return res
        .status(400)
        .json({ message: "No active maintenance found" });
    }

    activeMaintenance.cost = isNaN(Number(cost)) ? 0 : Number(cost);
    activeMaintenance.endDate = new Date();
    activeMaintenance.isActive = false;

    const start = new Date(activeMaintenance.startDate);
    const end = new Date(activeMaintenance.endDate);
    const durationDays = Math.ceil(
      (end - start) / (1000 * 60 * 60 * 24)
    );

    asset.maintenanceCount += 1;
    asset.totalMaintenanceCost += activeMaintenance.cost;
    asset.status = "available";

    await asset.save();

    await AssetHistory.create({
      asset: asset._id,
      action: "maintenance_completed",
      performedBy: req.user._id,
      notes: "Maintenance completed",
    });

    await logAudit({
      entityType: "MAINTENANCE",
      entityId: asset._id,
      action: "MAINTENANCE_COMPLETED",
      performedBy: req.user._id,
      details: {
        assetName: asset.name,
        assetSerial: asset.serialNumber,
        cost: activeMaintenance.cost,
        durationDays,
      },
    });

    res.json({ message: "Maintenance completed" });
  } catch (error) {
    handleError(res, error);
  }
};
