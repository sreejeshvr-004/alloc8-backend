import User from "../../models/userModel.js";
import Asset from "../../models/assetModel.js";

export const getEmployeeAssetListReport = async () => {
  const assets = await Asset.find({
    assignedTo: { $ne: null },
    isDeleted: false,
  })
    .populate("assignedTo", "name department")
    .sort({ createdAt: 1 });

  const columns = [
    "Employee Name",
    "Department",
    "Asset Name",
    "Category",
    "Serial Number",
  ];

  const rows = assets.map((asset) => [
    asset.assignedTo?.name || "-",
    asset.assignedTo?.department || "-",
    asset.name,
    asset.category,
    asset.serialNumber || "-",
  ]);

  return { columns, rows };
};
