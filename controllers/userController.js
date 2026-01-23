import User from "../models/userModel.js";
import Asset from "../models/assetModel.js";
import { logAudit } from "../utils/auditLogger.js";

import AssetHistory from "../models/assetHistoryModel.js";

// @desc    Get all users with assigned assets
// @route   GET /api/users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "employee" }).select("-password");

    const usersWithAssets = await Promise.all(
      users.map(async (user) => {
        const userAssets = await Asset.find({
          assignedTo: user._id,
          isDeleted: false,
        });

        return {
          ...user.toObject(),
          assets: userAssets, // attach here
        };
      }),
    );

    res.json(usersWithAssets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new user (Admin)
// @route   POST /api/users
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      department,
    });

    res.status(201).json({
      message: "User created successfully",
      userId: user._id,
    });
    await logAudit({
      entityType: "USER",
      entityId: user._id,
      action: "USER_CREATED",
      performedBy: req.user?._id,
      details: { email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.department = req.body.department || user.department;
    user.phone = req.body.phone ?? user.phone;
    user.salary = req.body.salary ?? user.salary;

    await user.save();
    res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Soft delete user
// @route   DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    res.json({ message: "User deleted (soft delete)" });
    await logAudit({
      entityType: "USER",
      entityId: user._id,
      action: "USER_DEACTIVATED",
      performedBy: req.user._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Restore deleted user
// @route   PUT /api/users/:id/restore
export const restoreUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isDeleted = false;
    user.deletedAt = null;

    await user.save();

    res.json({ message: "User restored successfully" });
    await logAudit({
      entityType: "USER",
      entityId: user._id,
      action: "USER_RESTORED",
      performedBy: req.user._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search users
// @route   GET /api/users/search
export const searchUsers = async (req, res) => {
  try {
    const { name, role, department } = req.query;

    const query = {
      isDeleted: false,
    };

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }
    if (role) {
      query.role = role;
    }
    if (department) {
      query.department = department;
    }

    const users = await User.find(query).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in employee assigned assets
// @route   GET /api/users/me/assets
// @access  Employee
export const getMyAssets = async (req, res) => {
  try {
    const assets = await Asset.find({
      assignedTo: req.user._id,
      isDeleted: false,
    }).select("name category serialNumber status maintenance");

    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployeeAssetHistory = async (req, res) => {
  try {
    const employeeId = req.params.id;

    // 1️⃣ Employee (even if inactive)
    const employee = await User.findById(employeeId).select(
      "name email department phone salary joiningDate isDeleted deletedAt",
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // 2️⃣ Get assignment-related history only
    const histories = await AssetHistory.find({
      assignedTo: employeeId,
      action: { $in: ["assigned", "unassigned"] },
    })
      .populate("asset", "name serialNumber")
      .sort({ createdAt: 1 });

    // 3️⃣ Build timeline from events
    const timeline = [];
    const openAssignments = {}; // assetId → from date

    for (const h of histories) {
      const assetId = h.asset._id.toString();

      if (h.action === "assigned") {
        openAssignments[assetId] = h.createdAt;
      }

      if (h.action === "unassigned" && openAssignments[assetId]) {
        timeline.push({
          assetId,
          assetName: h.asset.name,
          serial: h.asset.serialNumber,
          from: openAssignments[assetId],
          to: h.createdAt,
        });
        delete openAssignments[assetId];
      }
    }

    // 4️⃣ Still assigned assets (no unassigned yet)
    for (const assetId in openAssignments) {
      const asset = histories.find(
        (h) => h.asset._id.toString() === assetId,
      )?.asset;

      if (asset) {
        timeline.push({
          assetId,
          assetName: asset.name,
          serial: asset.serialNumber,
          from: openAssignments[assetId],
          to: null,
        });
      }
    }

    res.json({
      employee,
      assets: timeline,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
