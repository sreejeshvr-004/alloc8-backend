import express from "express";
import protect from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";
import {getReportsOverview,
  exportGenericTablePDF,exportGenericTableExcel,
  getFullAssetRegisterReport,exportFullAssetRegisterPDF,exportFullAssetRegisterExcel,
  getAssetsByCategoryReport,exportAssetsByCategoryPDF,exportAssetsByCategoryExcel,
  getAssetsByStatusReport,exportAssetsByStatusPDF,exportAssetsByStatusExcel,
  getAssetsByLocationReport,exportAssetsByLocationPDF,exportAssetsByLocationExcel,
  getMaintenanceLogsReport,exportMaintenanceLogsPDF,exportMaintenanceLogsExcel,
  getExpiringWarranty,exportExpiringWarrantyPDF,exportExpiringWarrantyExcel,
  getWarrantyAMCReportPreview,exportWarrantyAMCReportPDF,exportWarrantyAMCReportExcel,
  getAssignmentHistory,exportAssignmentHistoryPDF,exportAssignmentHistoryExcel,
  getTransferReportsController,exportTransferReportsPDF,exportTransferReportsExcel,
  getEmployeeAssetList,exportEmployeeAssetListPDF,exportEmployeeAssetListExcel,
  getPurchaseCostReportPreview,exportPurchaseCostPDF,exportPurchaseCostExcel,
  getAuditFindingsPreview,exportAuditFindingsPDF,exportAuditFindingsExcel,
  getWriteOffSummaryPreview,exportWriteOffSummaryPDF,exportWriteOffSummaryExcel,
  getMaintenanceExpensePreview,exportMaintenanceExpensePDF,exportMaintenanceExpenseExcel,
} from "../reports/controllers/reportController.js";

const router = express.Router();


router.get("/overview", protect, isAdmin, getReportsOverview);


router.get("/assets/full", protect, isAdmin, getFullAssetRegisterReport);
router.get("/assets/full/pdf", protect, isAdmin, exportFullAssetRegisterPDF);
router.get("/assets/full/excel",protect,isAdmin,exportFullAssetRegisterExcel);

router.get("/assets/by-category", protect, isAdmin, getAssetsByCategoryReport);
router.get("/assets/by-category/pdf",protect,isAdmin,exportAssetsByCategoryPDF);
router.get("/assets/by-category/excel",protect,isAdmin,exportAssetsByCategoryExcel);

router.get("/assets/by-status",protect,isAdmin,getAssetsByStatusReport);
router.get("/assets/by-status/pdf",protect,isAdmin,exportAssetsByStatusPDF);
router.get("/assets/by-status/excel",protect,isAdmin,exportAssetsByStatusExcel);

router.get("/assets/by-location",protect,isAdmin,getAssetsByLocationReport);
router.get("/assets/by-location/pdf",protect,isAdmin,exportAssetsByLocationPDF);
router.get("/assets/by-location/excel",protect,isAdmin,exportAssetsByLocationExcel);

router.get("/maintenance/logs",protect,isAdmin,getMaintenanceLogsReport);
router.get("/maintenance/logs/pdf",protect,isAdmin,exportMaintenanceLogsPDF);
router.get("/maintenance/logs/excel",protect,isAdmin,exportMaintenanceLogsExcel);

router.get("/assets/warranty/expiring",protect,isAdmin,getExpiringWarranty);
router.get("/assets/warranty/expiring/pdf",protect,isAdmin,exportExpiringWarrantyPDF);
router.get("/assets/warranty/expiring/excel",protect,isAdmin,exportExpiringWarrantyExcel);

router.get("/assets/warranty",protect,isAdmin,getWarrantyAMCReportPreview);
router.get("/assets/warranty/pdf",protect,isAdmin,exportWarrantyAMCReportPDF);
router.get("/assets/warranty/excel",protect,isAdmin,exportWarrantyAMCReportExcel);


router.get("/assignment/history",protect,isAdmin,getAssignmentHistory);
router.get("/assignment/history/pdf",protect,isAdmin,exportAssignmentHistoryPDF);
router.get("/assignment/history/excel",protect,isAdmin,exportAssignmentHistoryExcel);

router.get("/assignment/transfers",protect,isAdmin,getTransferReportsController);
router.get("/assignment/transfers/pdf",protect,isAdmin,exportTransferReportsPDF);
router.get("/assignment/transfers/excel",protect,isAdmin,exportTransferReportsExcel);

router.get("/assignment/employee-assets",protect,isAdmin,getEmployeeAssetList);
router.get("/assignment/employee-assets/pdf",protect,isAdmin,exportEmployeeAssetListPDF);
router.get("/assignment/employee-assets/excel",protect,isAdmin,exportEmployeeAssetListExcel);

// FINANCIAL & AUDIT
router.get("/financial/purchase-cost", protect, isAdmin, getPurchaseCostReportPreview);
router.get("/financial/purchase-cost/pdf", protect, isAdmin, exportPurchaseCostPDF);
router.get("/financial/purchase-cost/excel", protect, isAdmin, exportPurchaseCostExcel);

router.get("/financial/audit-findings", protect, isAdmin, getAuditFindingsPreview);
router.get("/financial/audit-findings/pdf", protect, isAdmin, exportAuditFindingsPDF);
router.get("/financial/audit-findings/excel", protect, isAdmin, exportAuditFindingsExcel);

router.get("/financial/write-off", protect, isAdmin, getWriteOffSummaryPreview);
router.get("/financial/write-off/pdf", protect, isAdmin, exportWriteOffSummaryPDF);
router.get("/financial/write-off/excel", protect, isAdmin, exportWriteOffSummaryExcel);

router.get("/financial/maintenance-expense",protect,isAdmin,getMaintenanceExpensePreview);
router.get("/financial/maintenance-expense/pdf",protect,isAdmin,exportMaintenanceExpensePDF);
router.get("/financial/maintenance-expense/excel",protect,isAdmin,exportMaintenanceExpenseExcel)

router.post("/export/pdf",protect,isAdmin,exportGenericTablePDF);
router.post("/export/excel",protect,isAdmin,exportGenericTableExcel);


export default router;
