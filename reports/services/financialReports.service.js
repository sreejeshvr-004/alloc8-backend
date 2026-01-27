import Asset from "../../models/assetModel.js";

/* ============================
   PURCHASE COST REPORT
============================ */
export const getPurchaseCostReport = async () => {
  const assets = await Asset.find({}); // include deleted too

  const columns = [
    "Asset Name",
    "Category",
    "Purchase Date",
    "Purchase Cost",
    "Status",
  ];

  const rows = assets.map((asset) => [
    asset.name,
    asset.category,
    asset.purchaseDate
      ? asset.purchaseDate.toISOString().split("T")[0]
      : "-",
    asset.purchaseCost ?? asset.purchasePrice ?? "-",
    asset.isDeleted ? "written-off / Inactive" : asset.status,
  ]);

  return { columns, rows };
};

/* ============================
   AUDIT FINDINGS
============================ */
export const getAuditFindingsReport = async () => {
  const assets = await Asset.find({
    isDeleted: false,
    status: { $in: ["issue_reported", "maintenance"] },
  });

  const columns = [
    "Asset Name",
    "Category",
    "Issue Type",
    "Current Status",
    "Last Updated",
  ];

  const rows = assets.map((asset) => [
    asset.name,
    asset.category,
    asset.status === "issue_reported" ? "Issue Reported" : "Maintenance",
    asset.status,
    asset.updatedAt.toLocaleString(),
  ]);

  return { columns, rows };
};

/* ============================
   WRITE-OFF SUMMARY
============================ */
export const getWriteOffSummaryReport = async () => {
  const assets = await Asset.find({
    isDeleted: true,
    // status: "replaced"||"inactive",
  });

  const columns = [
    "Asset Name",
    "Category",
    "Serial Number",
    "Write-off Reason",
    "Write-off Date",
  ];

  const rows = assets.map((asset) => [
    asset.name,
    asset.category,
    asset.serialNumber || "-",
    asset.writeOffReason || "End of Life",
    asset.updatedAt.toLocaleString(),
  ]);

  return { columns, rows };
};

export const getMaintenanceExpenseReport = async () => {
  const assets = await Asset.find({
    maintenance: { $exists: true, $ne: [] },
  });

  const columns = [
    "Asset Name",
    "Serial Number",
    "Category",
    "Maintenance Count",
    "Total Maintenance Cost",
    "Average Cost",
    "Status",
  ];

  const rows = assets.map((asset) => {
    const maintenanceCount = asset.maintenance.length;

    const totalCost = asset.maintenance.reduce(
      (sum, m) => sum + (m.cost ?? 0),
      0
    );

    const avgCost =
      maintenanceCount > 0
        ? Math.round(totalCost / maintenanceCount)
        : 0;

    return [
      asset.name,
      asset.serialNumber || "-",
      asset.category,
      maintenanceCount,
      totalCost,
      avgCost,
      asset.isDeleted?"Written-off" : asset.status,
    ];
  });

  return { columns, rows };
};
