import mongoose from "mongoose";

const assetIssueSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    issueType: {
      type: String,
      enum: ["damage", "performance", "battery", "hardware", "other"],
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "in_maintenance", "resolved"],
      default: "open",
    },

    // ADMIN ONLY FIELDS
    adminNotes: {
      type: String,
    },

    maintenance: {
      vendor: {
        type: String,
      },
      cost: {
        type: Number,
        default: 0,
      },
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

const AssetIssue = mongoose.model("AssetIssue", assetIssueSchema);
export default AssetIssue;
