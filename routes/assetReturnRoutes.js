import express from "express";
import protect from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";
import {
  requestReturn,
  getAllReturnRequests,
} from "../controllers/assetReturnController.js";

const router = express.Router();

/* EMPLOYEE */
router.post("/", protect, requestReturn);

/* ADMIN */
router.get("/", protect, isAdmin, getAllReturnRequests);

export default router;
