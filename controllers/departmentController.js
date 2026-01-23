import Department from "../models/departmentModel.js";
import User from "../models/userModel.js";

// GET
export const getDepartments = async (req, res) => {
  const departments = await Department.find({ isDeleted: false }).sort({
    name: 1,
  });
  res.json(departments);
};

// CREATE
export const createDepartment = async (req, res) => {
  const { name } = req.body;

  const exists = await Department.findOne({ name });
  if (exists) {
    return res.status(400).json({ message: "Department already exists" });
  }

  const dept = await Department.create({ name });
  res.status(201).json(dept);
};

// DELETE (block if users exist)
export const deleteDepartment = async (req, res) => {
  const dept = await Department.findById(req.params.id);
  if (!dept) return res.status(404).json({ message: "Department not found" });

  const users = await User.countDocuments({ department: dept.name });
  if (users > 0) {
    return res.status(400).json({
      message: "Cannot delete department in use",
    });
  }

  dept.isDeleted = true;
  await dept.save();

  res.json({ message: "Department deleted" });
};
