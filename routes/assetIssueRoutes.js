import express from "express";
import protect from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

import {
  reportIssue,
  getAllIssues,
  startMaintenance,
  completeMaintenance,
} from "../controllers/assetIssueController.js";

const router = express.Router();

/* EMPLOYEE */
router.post("/", protect, reportIssue);

/* ADMIN */
router.get("/", protect, isAdmin, getAllIssues);
router.put("/:id/start", protect, isAdmin, startMaintenance);
router.put("/:id/complete", protect, isAdmin, completeMaintenance);

export default router;
