import Asset from "../models/assetModel.js";
import AssetHistory from "../models/assetHistoryModel.js";

// GET /api/assets
export const getAssets = async (req, res) => {
  try {
    const assets = await Asset.find({ isDeleted: false }).populate(
      "assignedTo",
      "name email"
    );
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/assets
export const createAsset = async (req, res) => {
  try {
    const asset = await Asset.create(req.body);
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/assets/:id
export const updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset || asset.isDeleted) {
      return res.status(404).json({ message: "Asset not found" });
    }

    Object.assign(asset, req.body);
    await asset.save();

    res.json({ message: "Asset updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    await asset.save();

    res.json({ message: "Asset deleted (soft delete)" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ASSIGN
export const assignAsset = async (req, res) => {
  try {
    const { userId } = req.body;
    const asset = await Asset.findById(req.params.id);

    if (!asset || asset.isDeleted) {
      return res.status(404).json({ message: "Asset not found" });
    }

    if (asset.status === "assigned") {
      return res.status(400).json({ message: "Asset already assigned" });
    }

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

    res.json({ message: "Asset assigned successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UNASSIGN
export const unassignAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset || asset.isDeleted) {
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

    res.json({ message: "Asset unassigned successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// START MAINTENANCE (FIXED)
export const startMaintenance = async (req, res) => {
  try {
    const { reason, notes } = req.body;
    const asset = await Asset.findById(req.params.id);

    if (!asset || asset.isDeleted) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const activeMaintenance = asset.maintenance.find(
      (m) => m.isActive === true
    );

    if (activeMaintenance) {
      return res.status(400).json({
        message: "Active maintenance already exists",
      });
    }

    asset.assignedTo = null;
    asset.status = "maintenance";

    asset.maintenance.push({
      reason,
      notes,
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

    res.json({ message: "Asset sent for maintenance" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// COMPLETE MAINTENANCE (FIXED)
export const completeMaintenance = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset || asset.isDeleted) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const activeMaintenance = asset.maintenance.find(
      (m) => m.isActive === true
    );

    if (!activeMaintenance) {
      return res.status(400).json({
        message: "No active maintenance found",
      });
    }

    activeMaintenance.endDate = new Date();
    activeMaintenance.isActive = false;

    asset.status = "available";
    await asset.save();

    await AssetHistory.create({
      asset: asset._id,
      action: "maintenance_completed",
      performedBy: req.user._id,
      notes: "Maintenance completed",
    });

    res.json({ message: "Maintenance completed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
