import express from "express";
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  assignAsset,
  unassignAsset,
  startMaintenance,
  completeMaintenance,
} from "../controllers/assetController.js";
import protect from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";
import { getAssetHistory } from "../controllers/assetHistoryController.js";
import { exportAssetHistoryPDF } from "../controllers/assetExportController.js";

const router = express.Router();

// BASE
router.get("/", protect, isAdmin, getAssets);
router.post("/", protect, isAdmin, createAsset);

// ASSIGN / UNASSIGN
router.put("/assign/:id", protect, isAdmin, assignAsset);
router.put("/unassign/:id", protect, isAdmin, unassignAsset);

// MAINTENANCE (IMPORTANT: before :id)
router.put("/maintenance/:id", protect, isAdmin, startMaintenance);
router.put(
  "/maintenance/:id/complete",
  protect,
  isAdmin,
  completeMaintenance
);

// HISTORY
router.get("/:id/history", protect, isAdmin, getAssetHistory);
router.get("/:id/history/pdf", protect, isAdmin, exportAssetHistoryPDF);

// GENERIC (ALWAYS LAST)
router.put("/:id", protect, isAdmin, updateAsset);
router.delete("/:id", protect, isAdmin, deleteAsset);

export default router;
