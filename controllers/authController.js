import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";

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

// @desc    Forgot password (mock mail)
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email, isDeleted: false });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and store
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

  await user.save({ validateBeforeSave: false });

  // MOCK MAIL (console)
  const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

  console.log("📧 MOCK PASSWORD RESET MAIL");
  console.log(`To: ${user.email}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log("Expires in 15 minutes");

  res.json({ message: "Password reset link sent (mock)" });
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  const { password } = req.body;

  const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

if (!passwordRegex.test(password)) {
  return res.status(400).json({
    message:
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
  });
}


  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.json({ message: "Password reset successful" });
};
