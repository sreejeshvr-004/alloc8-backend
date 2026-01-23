import express from "express";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../controllers/assetCategoryController.js";
import protect from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, isAdmin, getCategories);
router.post("/", protect, isAdmin, createCategory);
router.delete("/:id", protect, isAdmin, deleteCategory);

export default router;
