import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import protect from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/stats", protect, isAdmin, getDashboardStats);

export default router;
