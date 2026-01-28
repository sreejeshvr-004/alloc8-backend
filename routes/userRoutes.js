import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  restoreUser,
  searchUsers,
  getEmployeeAssetHistory,getMyAssetHistory
} from "../controllers/userController.js";

import protect from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

import { exportUserAssetsPDF } from "../controllers/userExportController.js";
import { generateUserFullReportPDF } from "../controllers/userReportController.js";
import { exportAllEmployeesPDF } from "../controllers/userListExportController.js";
import { getMyAssets } from "../controllers/userController.js";

const router = express.Router();

router.get("/me/assets", protect, getMyAssets);//employee route
router.get("/me/asset-history", protect, getMyAssetHistory);

// Admin only
router.get("/", protect, isAdmin, getUsers);
router.get("/search", protect, isAdmin, searchUsers);
router.get("/:id", protect, isAdmin, getUserById);
router.post("/", protect, isAdmin, createUser);
router.put("/:id", protect, isAdmin, updateUser);
router.delete("/:id", protect, isAdmin, deleteUser);
router.put("/:id/restore", protect, isAdmin, restoreUser);

router.get("/:id/asset-history",protect,isAdmin,getEmployeeAssetHistory);


// router.get("/:id/assets/pdf", protect, isAdmin, exportUserAssetsPDF);

router.get("/:id/full-report/pdf",protect,isAdmin,generateUserFullReportPDF)

router.get("/export/all/pdf", protect, isAdmin, exportAllEmployeesPDF);



export default router;
