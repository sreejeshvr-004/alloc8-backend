import Asset from "../models/assetModel.js";

// GET /api/assets
export const getAssets = async (req, res) => {
  try {
    const assets = await Asset.find({ isDeleted: false })
      .populate("assignedTo", "name email");
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

// @desc    Assign asset to employee
// @route   PUT /api/assets/assign/:id
export const assignAsset = async (req, res) => {
  try {
    const { userId } = req.body; // employee id
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

    res.json({ message: "Asset assigned successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unassign asset
// @route   PUT /api/assets/unassign/:id
export const unassignAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset || asset.isDeleted) {
      return res.status(404).json({ message: "Asset not found" });
    }

    if (asset.status !== "assigned") {
      return res.status(400).json({ message: "Asset is not assigned" });
    }

    asset.assignedTo = null;
    asset.status = "available";

    await asset.save();

    res.json({ message: "Asset unassigned successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
