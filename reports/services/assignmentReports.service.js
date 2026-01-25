import AssetHistory from "../../models/assetHistoryModel.js";
import Asset from "../../models/assetModel.js";
import User from "../../models/userModel.js";

const ACTION_LABELS = {
  created: "Created",
  assigned: "Assigned",
  unassigned: "Unassigned",
  issue_reported: "Issue Reported",
  maintenance_started: "Maintenance Started",
  maintenance_completed: "Maintenance Completed",
  deactivated: "Deactivated",
};

export const getAssignmentHistoryReport = async () => {
  const history = await AssetHistory.find()
    .populate("asset", "name category")
    .populate("performedBy", "name")
    .populate("assignedTo", "name")
    .sort({ createdAt: -1 });

  const columns = [
    "Asset Name",
    "Category",
    "Action",
    "From / To User",
    "Initiated By",
    "Performed By",
    "Date",
    "Notes",
  ];

  const rows = history.map((h) => [
    h.asset?.name || "-",
    h.asset?.category || "-",
    ACTION_LABELS[h.action] || h.action,
    h.assignedTo?.name || "-",
    h.initiatedBy?.name || "-",
    h.performedBy?.name || "System",
    new Date(h.createdAt).toLocaleString(),
    h.notes || "-",
  ]);

  return { columns, rows };
};


export const getTransferReports = async () => {
  const history = await AssetHistory.find({
    action: { $in: ["assigned", "unassigned"] },
  })
    .populate("asset", "name category")
    .populate("performedBy", "name")
    .populate("assignedTo", "name")
    .sort({ createdAt: -1 });

  const columns = [
    "Asset Name",
    "Category",
    "Action",
    "From / To User",
    "Performed By",
    "Date",
    "Notes",
  ];

  const rows = history.map((h) => [
    h.asset?.name || "-",
    h.asset?.category || "-",
    h.action.replace("_", " "),
    h.assignedTo?.name || "-",
    h.performedBy?.name || "-",
    new Date(h.createdAt).toLocaleString(),
    h.notes || "-",
  ]);

  return { columns, rows };
};
