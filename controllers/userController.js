import User from "../models/userModel.js";
import Asset from "../models/assetModel.js";

// @desc    Get all users with assigned assets
// @route   GET /api/users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false })
      .select("-password");

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
      })
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
    await user.save();

    res.json({ message: "User deleted (soft delete)" });
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
    await user.save();

    res.json({ message: "User restored successfully" });
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
