import Request from "../models/requestModel.js";
import Asset from "../models/assetModel.js";
import { logAudit } from "../utils/auditLogger.js";

// @desc Employee creates request
// @route POST /api/requests
export const createRequest = async (req, res) => {
  try {
    const { assetCategory, reason } = req.body;

    const request = await Request.create({
      user: req.user._id,
      assetCategory,
      reason,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Employee gets own requests
// @route GET /api/requests/my
export const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ user: req.user._id })
      .populate("assignedAsset", "name category")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Admin gets all requests
// @route GET /api/requests
export const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("user", "name email")
      .populate("assignedAsset", "name category")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Admin approve/reject request
// @route PUT /api/requests/:id
export const updateRequestStatus = async (req, res) => {
  try {
    const { status, assetId, rejectionReason } = req.body;

    const request = await Request.findById(req.params.id).populate("user");
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    request.status = status;

    // 🔴 REJECTED FLOW
    if (status === "rejected") {
      request.rejectionReason = rejectionReason || "Not approved by admin";

      await request.save();

      await logAudit({
        entityType: "REQUEST",
        entityId: request._id,
        action: "REQUEST_REJECTED",
        performedBy: req.user._id,
        details: {
          employeeName: request.user.name,
          assetCategory: request.assetCategory,
          reason: request.rejectionReason,
        },
      });

      return res.json({ message: "Request rejected" });
    }

    // 🟢 APPROVED FLOW (existing logic)
    // 🟢 APPROVED FLOW
    if (status === "approved") {
      if (!assetId) {
        return res
          .status(400)
          .json({ message: "Asset ID required for approval" });
      }

      const asset = await Asset.findById(assetId);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }

      // 1️⃣ Category match
      if (asset.category !== request.assetCategory) {
        return res.status(400).json({
          message: "Asset category does not match request",
        });
      }

      // 2️⃣ Availability check
      if (asset.status !== "available") {
        return res.status(400).json({
          message: "Asset is not available",
        });
      }

      // Assign asset
      asset.status = "assigned";
      asset.assignedTo = request.user._id;
      await asset.save();

      // Update request
      request.status = "approved";
      request.assignedAsset = asset._id;
      await request.save();

      await logAudit({
        entityType: "REQUEST",
        entityId: request._id,
        action: "REQUEST_APPROVED",
        performedBy: req.user._id,
        details: {
          employeeName: request.user.name,
          assetCategory: request.assetCategory,
          assetName: asset.name,
          assetSerial: asset.serialNumber,
        },
      });

      return res.json({ message: "Request approved" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
