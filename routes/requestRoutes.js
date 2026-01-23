import express from "express";
import {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
} from "../controllers/requestController.js";
import protect from "../middleware/authMiddleware.js";
import {isAdmin} from "../middleware/roleMiddleware.js";

import { exportAllRequestsPDF } from "../controllers/requestListExportController.js";


const router = express.Router();

// Employee
router.post("/", protect, createRequest);
router.get("/my", protect, getMyRequests);

// Admin
router.get("/", protect,isAdmin, getAllRequests);
router.put("/:id", protect,isAdmin, updateRequestStatus);

router.get("/export/all/pdf", protect, isAdmin, exportAllRequestsPDF);


export default router;