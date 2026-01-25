import { exportTableToPDF } from "../exporters/pdfTableExporter.js";
import { exportTableToExcel } from "../exporters/excelTableExporter.js";

import { getFullAssetRegister } from "../services/assetReports.service.js";
import { getAssetsByCategory } from "../services/assetReports.service.js";
import { getAssetsByStatus } from "../services/assetReports.service.js";
import { getAssetsByLocation } from "../services/assetReports.service.js";
import { getMaintenanceLogs } from "../services/maintenanceReports.service.js";
import { getExpiringWarrantyReport } from "../services/assetReports.service.js";
import { getWarrantyAMCReport } from "../services/assetReports.service.js";
import { getAssignmentHistoryReport } from "../services/assignmentReports.service.js";
import { getTransferReports } from "../services/assignmentReports.service.js";
import { getEmployeeAssetListReport } from "../services/userReports.service.js";


export const getFullAssetRegisterReport = async (req, res) => {
  try {
    const data = await getFullAssetRegister();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportFullAssetRegisterPDF = async (req, res) => {
  try {
    const { columns, rows } = await getFullAssetRegister();

    exportTableToPDF(
      res,
      "Full Asset Register",
      columns,
      rows,
      {
        generatedBy: req.user.email,
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const exportFullAssetRegisterExcel = async (req, res) => {
  try {
    const { columns, rows } = await getFullAssetRegister();

    await exportTableToExcel(
      res,
      "Full Asset Register",
      columns,
      rows,
      {
        generatedBy: req.user.email,
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAssetsByCategoryReport = async (req, res) => {
  try {
    const data = await getAssetsByCategory();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportAssetsByCategoryPDF = async (req, res) => {
  try {
    const { columns, rows } = await getAssetsByCategory();

    exportTableToPDF(
      res,
      "Assets By Category",
      columns,
      rows,
      { generatedBy: req.user.email }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportAssetsByCategoryExcel = async (req, res) => {
  try {
    const { columns, rows } = await getAssetsByCategory();

    await exportTableToExcel(
      res,
      "Assets By Category",
      columns,
      rows,
      { generatedBy: req.user.email }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAssetsByStatusReport = async (req, res) => {
  try {
    const data = await getAssetsByStatus();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportAssetsByStatusPDF = async (req, res) => {
  try {
    const { columns, rows } = await getAssetsByStatus();

    exportTableToPDF(
      res,
      "Assets By Status",
      columns,
      rows,
      { generatedBy: req.user.email }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportAssetsByStatusExcel = async (req, res) => {
  try {
    const { columns, rows } = await getAssetsByStatus();

    await exportTableToExcel(
      res,
      "Assets By Status",
      columns,
      rows,
      { generatedBy: req.user.email }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAssetsByLocationReport = async (req, res) => {
  try {
    const data = await getAssetsByLocation();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportAssetsByLocationPDF = async (req, res) => {
  try {
    const { columns, rows } = await getAssetsByLocation();

    exportTableToPDF(
      res,
      "Assets By Location",
      columns,
      rows,
      { generatedBy: req.user.email }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportAssetsByLocationExcel = async (req, res) => {
  try {
    const { columns, rows } = await getAssetsByLocation();

    await exportTableToExcel(
      res,
      "Assets By Location",
      columns,
      rows,
      { generatedBy: req.user.email }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getMaintenanceLogsReport = async (req, res) => {
  try {
    const data = await getMaintenanceLogs();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportMaintenanceLogsPDF = async (req, res) => {
  try {
    const { columns, rows } = await getMaintenanceLogs();

    exportTableToPDF(
      res,
      "Maintenance Logs",
      columns,
      rows,
      { generatedBy: req.user.email }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportMaintenanceLogsExcel = async (req, res) => {
  try {
    const { columns, rows } = await getMaintenanceLogs();

    await exportTableToExcel(
      res,
      "Maintenance Logs",
      columns,
      rows,
      { generatedBy: req.user.email }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getExpiringWarranty = async (req, res) => {
  try {
    const data = await getExpiringWarrantyReport(30);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const exportExpiringWarrantyPDF = async (req, res) => {
  const { columns, rows } = await getExpiringWarrantyReport(30);
  exportTableToPDF(res, "Expiring Warranty Report", columns, rows, {
    generatedBy: req.user.email,
  });
};

export const exportExpiringWarrantyExcel = async (req, res) => {
  const { columns, rows } = await getExpiringWarrantyReport(30);
  await exportTableToExcel(res, "Expiring Warranty Report", columns, rows, {
    generatedBy: req.user.email,
  });
};


export const getWarrantyAMCReportPreview = async (req, res) => {
  try {
    const data = await getWarrantyAMCReport();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportWarrantyAMCReportPDF = async (req, res) => {
  const { columns, rows } = await getWarrantyAMCReport();
  exportTableToPDF(
    res,
    "Warranty & AMC Report",
    columns,
    rows,
    { generatedBy: req.user.email }
  );
};

export const exportWarrantyAMCReportExcel = async (req, res) => {
  const { columns, rows } = await getWarrantyAMCReport();
  await exportTableToExcel(
    res,
    "Warranty & AMC Report",
    columns,
    rows,
    { generatedBy: req.user.email }
  );
};


export const getAssignmentHistory = async (req, res) => {
  try {
    const data = await getAssignmentHistoryReport();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportAssignmentHistoryPDF = async (req, res) => {
  try {
    const { columns, rows } = await getAssignmentHistoryReport();

    exportTableToPDF(res, "Assignment History", columns, rows, {
      generatedBy: req.user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportAssignmentHistoryExcel = async (req, res) => {
  try {
    const { columns, rows } = await getAssignmentHistoryReport();

    await exportTableToExcel(res, "Assignment History", columns, rows, {
      generatedBy: req.user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTransferReportsController = async (req, res) => {
  try {
    const data = await getTransferReports();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportTransferReportsPDF = async (req, res) => {
  try {
    const { columns, rows } = await getTransferReports();

    exportTableToPDF(res, "Transfer Reports", columns, rows, {
      generatedBy: req.user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportTransferReportsExcel = async (req,res) => {
   try {
    const { columns, rows } = await getTransferReports();

    await exportTableToExcel(res, "Transfer Reports", columns, rows, {
      generatedBy: req.user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployeeAssetList = async (req, res) => {
  try {
    const data = await getEmployeeAssetListReport();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportEmployeeAssetListPDF = async (req, res) => {
  try {
    const { columns, rows } = await getEmployeeAssetListReport();

    exportTableToPDF(res, "Employee Asset List", columns, rows, {
      generatedBy: req.user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportEmployeeAssetListExcel = async (req, res) => {
  try {
    const { columns, rows } = await getEmployeeAssetListReport();

    await exportTableToExcel(res, "Employee Asset List", columns, rows, {
      generatedBy: req.user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
