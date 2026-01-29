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
    const { name, category } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        message: "Asset name and category are required",
      });
    }

    const imagePaths = req.files
      ? req.files.map((file) => `/uploads/assets/${file.filename}`)
      : [];

    const asset = await Asset.create({
      ...req.body,
      images: imagePaths,
    });

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
    if (req.files && req.files.length > 0) {
     const uploadedImages = req.files.map(
       (file) => `/uploads/assets/${file.filename}`
     );

     asset.images = [...(asset.images || []), ...uploadedImages];
   }
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
    const previousUser = asset.assignedTo;

    asset.isDeleted = true;
    asset.status = "inactive";
    asset.assignedTo = null;
    await asset.save();

    await AssetHistory.create({
      asset: asset._id,
      action: "deactivated",
      assignedTo: previousUser,
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

   if (!["assigned", "return_requested"].includes(asset.status)) {
  return res.status(400).json({
    message: "Asset cannot be unassigned in its current state",
  });
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
      assignedTo: asset.assignedTo,
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
    const { cost, vendor, notes } = req.body;

    const asset = await findActiveAssetById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const activeMaintenance = asset.maintenance.find((m) => m.isActive);
    if (!activeMaintenance) {
      return res.status(400).json({ message: "No active maintenance found" });
    }

    activeMaintenance.cost = isNaN(Number(cost)) ? 0 : Number(cost);
    activeMaintenance.vendor = vendor || "";
    activeMaintenance.notes = notes || activeMaintenance.notes;
    activeMaintenance.endDate = new Date();
    activeMaintenance.isActive = false;

    const start = new Date(activeMaintenance.startDate);
    const end = new Date(activeMaintenance.endDate);
    const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

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


// ADD IMAGES TO ASSET
// PUT /api/assets/:id/images
export const addAssetImages = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset || asset.isDeleted) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const newImages = req.files
      ? req.files.map((file) => `/uploads/assets/${file.filename}`)
      : [];

    asset.images.push(...newImages);
    await asset.save();

    res.json({ message: "Images added successfully", images: asset.images });
  } catch (error) {
    handleError(res, error);
  }
};
// DELETE ASSET IMAGE
// DELETE /api/assets/:id/images
export const deleteAssetImage = async (req, res) => {
  try {
    const { imagePath } = req.body;

    const asset = await Asset.findById(req.params.id);
    if (!asset || asset.isDeleted) {
      return res.status(404).json({ message: "Asset not found" });
    }

    asset.images = asset.images.filter((img) => img !== imagePath);
    await asset.save();

    res.json({ message: "Image removed successfully", images: asset.images });
  } catch (error) {
    handleError(res, error);
  }
};


