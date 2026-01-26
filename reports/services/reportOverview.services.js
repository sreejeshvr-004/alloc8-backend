import Asset from "../../models/assetModel.js";

export const getReportOverview = async () => {
  const now = new Date();
  const next30Days = new Date();
  next30Days.setDate(now.getDate() + 30);

  const [
    totalAssets,
    assigned,
    available,
    maintenance,
    expiring,
    pending,
  ] = await Promise.all([
    Asset.countDocuments({ isDeleted: false }),
    Asset.countDocuments({ status: "assigned", isDeleted: false }),
    Asset.countDocuments({ status: "available", isDeleted: false }),
    Asset.countDocuments({ status: "maintenance", isDeleted: false }),
    Asset.countDocuments({
      warrantyExpiry: { $lte: next30Days, $gte: now },
      isDeleted: false,
    }),
    Asset.countDocuments({ status: "issue_reported", isDeleted: false }),
  ]);

  return {
    totalAssets,
    assigned,
    unassigned: available,
    maintenance,
    expiring,
    pending,
  };
};
