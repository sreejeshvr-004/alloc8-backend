import mongoose from "mongoose";

const assetHistorySchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    action: {
  type: String,
  enum: [
  "created",
  "assigned",
  "unassigned",
  "issue_reported",
  "maintenance_started",
  "maintenance_completed",
  "deactivated",

]
,
  required: true,
},
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

const AssetHistory = mongoose.model("AssetHistory", assetHistorySchema);
export default AssetHistory;
