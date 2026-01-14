import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

// @desc    Register user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  const { name, email, password, department } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "employee",
    department,
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
};

// @desc    Login user
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, isDeleted: false });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/profile
export const getUserProfile = async (req, res) => {
  res.json(req.user);
};