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
import { exportAssetFullReportPDF } from "../controllers/assetFullReportController.js";
import { exportAllAssetsPDF } from "../controllers/assetListExportController.js";
import { exportMaintenanceRecordsPDF } from "../controllers/maintenanceExportController.js";

const router = express.Router();

// ================= BASE =================
router.get("/", protect, isAdmin, getAssets);
router.post("/", protect, isAdmin, createAsset);

// ================= ASSIGN / UNASSIGN =================
router.put("/assign/:id", protect, isAdmin, assignAsset);
router.put("/unassign/:id", protect, isAdmin, unassignAsset);

// ================= MAINTENANCE =================
router.put("/maintenance/:id", protect, isAdmin, startMaintenance);
router.put(
  "/maintenance/:id/complete",
  protect,
  isAdmin,
  completeMaintenance
);

// ================= EXPORTS & HISTORY (MUST COME FIRST) =================
router.get("/export/all/pdf", protect, isAdmin, exportAllAssetsPDF);
router.get(
  "/maintenance/export/all/pdf",
  protect,
  isAdmin,
  exportMaintenanceRecordsPDF
);

router.get("/:id/history", protect, isAdmin, getAssetHistory);
router.get("/:id/history/pdf", protect, isAdmin, exportAssetHistoryPDF);
router.get("/:id/full-report/pdf", protect, isAdmin, exportAssetFullReportPDF);

// ================= GENERIC (ALWAYS LAST) =================
router.put("/:id", protect, isAdmin, updateAsset);
router.delete("/:id", protect, isAdmin, deleteAsset);

export default router;
