import express from "express";
import {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
} from "../controllers/requestController.js";
import protect from "../middleware/authMiddleware.js";
import isAdmin from "../middleware/roleMiddleware.js";

const router = express.Router();

// Employee
router.post("/", protect, createRequest);
router.get("/my", protect, getMyRequests);

// Admin
router.get("/", protect, isAdmin, getAllRequests);
router.put("/:id", protect, isAdmin, updateRequestStatus);

export default router;