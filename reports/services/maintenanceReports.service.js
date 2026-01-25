import Asset from "../../models/assetModel.js";

export const getMaintenanceLogs = async () => {
  const assets = await Asset.find({
    maintenance: { $exists: true, $ne: [] },
    isDeleted: false,
  });

  const columns = [
    "Asset Name",
    "Category",
    "Issue",
    "Vendor",
    "Start Date",
    "End Date",
    "Cost",
    "Status",
  ];

  const rows = [];

  assets.forEach((asset) => {
    asset.maintenance.forEach((m) => {
      rows.push([
        asset.name,
        asset.category,
        m.issue || "-",
        m.vendor || "-",
        m.startDate
          ? m.startDate.toISOString().split("T")[0]
          : "-",
        m.endDate
          ? m.endDate.toISOString().split("T")[0]
          : "-",
        m.cost ?? 0,
        m.isActive ? "Active" : "Completed",
      ]);
    });
  });

  return { columns, rows };
};
