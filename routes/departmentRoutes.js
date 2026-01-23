import express from "express";
import protect from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";
import {
  getDepartments,
  createDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";

const router = express.Router();

router.get("/", protect, isAdmin, getDepartments);
router.post("/", protect, isAdmin, createDepartment);
router.delete("/:id", protect, isAdmin, deleteDepartment);

export default router;
