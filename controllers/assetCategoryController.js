import AssetCategory from "../models/assetCategoryModel.js";
import Asset from "../models/assetModel.js";

// GET all categories
export const getCategories = async (req, res) => {
  const categories = await AssetCategory.find({ isDeleted: false }).sort({
    name: 1,
  });
  res.json(categories);
};

// CREATE category
export const createCategory = async (req, res) => {
  const { name } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const exists = await AssetCategory.findOne({
    name: name.trim(),
    isDeleted: false,
  });

  if (exists) {
    return res.status(400).json({ message: "Category already exists" });
  }

  const category = await AssetCategory.create({ name: name.trim() });
  res.status(201).json(category);
};

// DELETE category (BLOCK if used)
export const deleteCategory = async (req, res) => {
  const category = await AssetCategory.findById(req.params.id);

  if (!category || category.isDeleted) {
    return res.status(404).json({ message: "Category not found" });
  }

  const used = await Asset.exists({ category: category.name });

  if (used) {
    return res.status(400).json({
      message: "Cannot delete category. Assets are using this category.",
    });
  }

  category.isDeleted = true;
  await category.save();

  res.json({ message: "Category deleted" });
};
