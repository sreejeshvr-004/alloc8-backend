import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true, // Laptop, Phone, Monitor, etc.
    },
    serialNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["available", "assigned", "maintenance", "replaced"],
      default: "available",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    history: [
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    action: {
      type: String,
      enum: ["assigned", "unassigned"],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
],

  },
  { timestamps: true }
);

const Asset = mongoose.model("Asset", assetSchema);
export default Asset;
