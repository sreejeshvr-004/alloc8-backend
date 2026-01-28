import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    issue: String,
    vendor: String,
    cost: {
      type: Number,
      default: 0,
    },
    startDate: Date,
    endDate: Date,
    notes: String,
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const assetSchema = new mongoose.Schema(
  {
    // BASIC INFO
    images: {
      type: [String], //image URL/path
      default: [],
    },
    name: { type: String, required: true },
    category: { type: String, required: true },

    // AUTO SERIAL NUMBER
    serialNumber: {
      type: String,
      unique: true,
    },

    // FINANCIAL INFO
    assetCost: {
      type: Number,
      default: 0,
    },

    purchaseDate: Date,
    warrantyExpiry: Date,

    // STATUS
    status: {
      type: String,
      enum: [
        "available",
        "assigned",
        "issue_reported",
        "return_requested",
        "maintenance",
        "inactive",
      ],
      default: "available",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // MAINTENANCE DETAILS
    maintenance: [maintenanceSchema],

    maintenanceCount: {
      type: Number,
      default: 0,
    },

    totalMaintenanceCost: {
      type: Number,
      default: 0,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    issue: {
      type: {
        type: String,
      },
      description: String,
      reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reportedAt: Date,
    },
  },
  { timestamps: true },
);

// AUTO SERIAL NUMBER GENERATION
assetSchema.pre("save", async function () {
  if (this.serialNumber) return;

  const count = await mongoose.model("Asset").countDocuments();
  this.serialNumber = `ALLOC8-AST-${count + 1}`;
});

const Asset = mongoose.model("Asset", assetSchema);
export default Asset;
