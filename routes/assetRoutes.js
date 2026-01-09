import express from "express";
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  assignAsset,
  unassignAsset,
  getAssetHistory
} from "../controllers/assetController.js";
import protect from "../middleware/authMiddleware.js";
import {isAdmin} from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, isAdmin, getAssets);
router.post("/", protect, isAdmin, createAsset);
router.put("/:id", protect, isAdmin, updateAsset);
router.delete("/:id", protect, isAdmin, deleteAsset);
router.put("/assign/:id", protect, isAdmin, assignAsset);
router.put("/unassign/:id", protect, isAdmin, unassignAsset);
router.get("/:id/history", protect, isAdmin, getAssetHistory);



export default router;
