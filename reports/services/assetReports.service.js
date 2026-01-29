import Asset from "../../models/assetModel.js";
import User from "../../models/userModel.js";

export const getFullAssetRegister = async () => {
  const assets = await Asset.find({ isDeleted: false })
    .populate("assignedTo", "name department")
    .sort({ createdAt: 1 });

  const columns = [
    "Asset Name",
    "Category",
    "Serial Number",
    "Status",
    "Assigned To",
    "Department",
  ];

  const rows = assets.map((asset) => [
    asset.name,
    asset.category,
    asset.serialNumber || "-",
    asset.status,
    asset.assignedTo?.name || "-",
    asset.assignedTo?.department || "-",
  ]);

  return { columns, rows };
};

export const getAssetsByCategory = async () => {
  const assets = await Asset.find({});

  const categoryMap = {};

  assets.forEach((asset) => {
    const category = asset.category || "Uncategorized";

    if (!categoryMap[category]) {
      categoryMap[category] = {
        total: 0,
        assigned: 0,
        available: 0,
        maintenance: 0,
        issue_reported: 0,
        inactive: 0,
      };
    }

    categoryMap[category].total += 1;

    if (categoryMap[category][asset.status] !== undefined) {
      categoryMap[category][asset.status] += 1;
    }
  });

  const columns = [
    "Category",
    "Total Assets",
    "Assigned",
    "Available",
    "Maintenance",
    "Issue Reported",
    "Inactive",
  ];

  const rows = Object.entries(categoryMap).map(
    ([category, stats]) => [
      category,
      stats.total,
      stats.assigned,
      stats.available,
      stats.maintenance,
      stats.issue_reported,
      stats.inactive,
    ]
  );

  return { columns, rows };
};

export const getAssetsByStatus = async () => {
  const assets = await Asset.find({}); // include deleted

  const STATUS_LIST = [
    "available",
    "assigned",
    "maintenance",
    "issue_reported",
    "inactive",
  ];

  // initialize map safely
  const statusMap = {};
  STATUS_LIST.forEach((s) => {
    statusMap[s] = { total: 0, categories: {} };
  });

  for (const asset of assets) {
    // derive status safely
    let status = "available";

    if (asset?.isDeleted === true) {
      status = "inactive";
    } else if (typeof asset?.status === "string") {
      status = asset.status;
    }

    // skip unknown statuses safely
    if (!statusMap[status]) continue;

    const category =
      typeof asset?.category === "string" && asset.category.trim()
        ? asset.category
        : "Uncategorized";

    statusMap[status].total += 1;
    statusMap[status].categories[category] =
      (statusMap[status].categories[category] || 0) + 1;
  }

  const columns = ["Status", "Total Assets", "Category"];

  const rows = STATUS_LIST.map((status) => {
    const data = statusMap[status];

    const categoryText =
      Object.keys(data.categories).length === 0
        ? "-"
        : Object.entries(data.categories)
            .map(([cat, count]) => `${cat} (${count})`)
            .join(", ");

    return [status, data.total, categoryText];
  });

  return { columns, rows };
};

export const getAssetsByLocation = async () => {
  const assets = await Asset.find({ isDeleted: false })
    .populate("assignedTo", "department");

  /**
   * Structure:
   * {
   *   IT: { Laptop: 2, Monitor: 1 },
   *   HR: { Laptop: 1 }
   * }
   */
  const locationCategoryMap = {};

  assets.forEach((asset) => {
    if (!asset.assignedTo?.department) return;

    const location = asset.assignedTo.department;
    const category = asset.category || "Unknown";

    if (!locationCategoryMap[location]) {
      locationCategoryMap[location] = {};
    }

    if (!locationCategoryMap[location][category]) {
      locationCategoryMap[location][category] = 0;
    }

    locationCategoryMap[location][category] += 1;
  });

  const columns = ["Location", "Category", "Total Assets"];

  const rows = [];

  Object.entries(locationCategoryMap).forEach(
    ([location, categories]) => {
      Object.entries(categories).forEach(
        ([category, count]) => {
          rows.push([location, category, count]);
        }
      );
    }
  );

  return { columns, rows };
};


export const getExpiringWarrantyReport = async (days = 30) => {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  const assets = await Asset.find({
    isDeleted: false,
    warrantyExpiry: { $gte: today, $lte: futureDate },
  })
    .populate("assignedTo", "name")
    .sort({ warrantyExpiry: 1 });

  const columns = [
    "Asset Name",
    "Category",
    "Serial Number",
    "Warranty Expiry",
    "Days Left",
    "Status",
    "Assigned To",
  ];

  const rows = assets.map((asset) => {
    const daysLeft = Math.ceil(
      (asset.warrantyExpiry - today) / (1000 * 60 * 60 * 24)
    );

    return [
      asset.name,
      asset.category,
      asset.serialNumber || "-",
      asset.warrantyExpiry.toISOString().split("T")[0],
      daysLeft,
      asset.status,
      asset.assignedTo?.name || "-",
    ];
  });

  return { columns, rows };
};


export const getWarrantyAMCReport = async () => {
  const today = new Date();

  const assets = await Asset.find({
    isDeleted: false,
    warrantyExpiry: { $exists: true, $ne: null },
  })
    .populate("assignedTo", "name")
    .sort({ warrantyExpiry: 1 });

  const columns = [
    "Asset Name",
    "Category",
    "Serial Number",
    "Coverage Type",
    "Start Date",
    "End Date",
    "Days Left",
    "Status",
    "Assigned To",
  ];

  const rows = assets.map((asset) => {
    const daysLeft = asset.warrantyExpiry
      ? Math.ceil(
          (asset.warrantyExpiry - today) / (1000 * 60 * 60 * 24)
        )
      : "-";

    return [
      asset.name,
      asset.category,
      asset.serialNumber || "-",
      "Warranty",
      asset.purchaseDate
        ? asset.purchaseDate.toISOString().split("T")[0]
        : "-",
      asset.warrantyExpiry
        ? asset.warrantyExpiry.toISOString().split("T")[0]
        : "-",
      daysLeft,
      asset.status,
      asset.assignedTo?.name || "-",
    ];
  });

  return { columns, rows };
};
