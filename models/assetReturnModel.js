import mongoose from "mongoose";

const assetReturnSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      default: "",
    },

    isCompleted: {
      type: Boolean,
      default: false, // becomes true AFTER admin unassigns
    },
  },
  { timestamps: true }
);

const AssetReturn = mongoose.model("AssetReturn", assetReturnSchema);
export default AssetReturn;
