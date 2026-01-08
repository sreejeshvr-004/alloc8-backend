import Request from "../models/requestModel.js";
import Asset from "../models/assetModel.js";

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
    const { status, assetId } = req.body; // status: approved/rejected
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    // If approved, assign asset
    if (status === "approved") {
      const asset = await Asset.findById(assetId);

      if (!asset || asset.status !== "available") {
        return res.status(400).json({ message: "Asset not available" });
      }

      asset.status = "assigned";
      asset.assignedTo = request.user;
      await asset.save();

      request.assignedAsset = asset._id;
    }

    request.status = status;
    await request.save();

    res.json({ message: `Request ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};