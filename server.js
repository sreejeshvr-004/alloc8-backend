import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import requestRoutes from "./routes/requestRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js"

import employeeRoutes from "./routes/employeeRoutes.js"
import issueRoutes from "./routes/assetIssueRoutes.js";
import assetCategoryRoutes from "./routes/assetCategoryRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use("/api/employee", employeeRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/asset-categories", assetCategoryRoutes);
app.use("/api/departments", departmentRoutes);



// Test route
app.get("/", (req, res) => {
  res.send("Asset Management API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});





