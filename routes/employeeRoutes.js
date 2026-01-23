import express from "express";
import protect from "../middleware/authMiddleware.js";
import { reportAssetIssue } from "../controllers/employeeIssueController.js";

const router = express.Router();

router.post(
  "/assets/:id/report-issue",
  protect,
  reportAssetIssue
);

export default router;
