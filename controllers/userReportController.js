import User from "../models/userModel.js";
import Asset from "../models/assetModel.js";
import AssetHistory from "../models/assetHistoryModel.js";
import Request from "../models/requestModel.js";
import PDFDocument from "pdfkit";

export const generateUserFullReportPDF = async (req, res) => {
  try {
    const userId = req.params.id;

    /* ===============================
       1. USER SUMMARY
       =============================== */
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    /* ===============================
       2. CURRENT ASSIGNED ASSETS
       =============================== */
    const currentAssets = await Asset.find({
      assignedTo: userId,
      status: "assigned",
    })
      .select("name category serialNumber assignedAt status")
      .lean();

    /* ===============================
       3. ASSET ASSIGNMENT HISTORY
       =============================== */
    const assignmentHistoryRaw = await AssetHistory.find({
      assignedTo: userId,
      action: { $in: ["assigned", "unassigned"] },
    })
      .populate("asset", "name serialNumber")
      .sort({ createdAt: 1 })
      .lean();

    const assignmentHistory = [];
    let current = null;

    for (const h of assignmentHistoryRaw) {
      if (h.action === "assigned") {
        if (current) {
          current.to = h.createdAt;
          assignmentHistory.push(current);
        }

        current = {
          assetName: h.asset?.name || "-",
          serialNumber: h.asset?.serialNumber || "-",
          from: h.createdAt,
          to: null,
        };
      }

      if (h.action === "unassigned" && current) {
        current.to = h.createdAt;
        assignmentHistory.push(current);
        current = null;
      }
    }

    if (current) assignmentHistory.push(current);

    /* ===============================
       4. MAINTENANCE HISTORY
       =============================== */
    const maintenanceHistory = await AssetHistory.find({
      action: { $in: ["maintenance_started", "maintenance_completed"] },
      assignedTo: userId,
    })
      .populate("asset", "name")
      .sort({ createdAt: 1 })
      .lean();

    /* ===============================
       5. REQUEST HISTORY
       =============================== */
    const requests = await Request.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    /* ===============================
       6. SUMMARY STATS
       =============================== */
    const summary = {
      totalAssignments: assignmentHistory.length,
      activeAssets: currentAssets.length,
      maintenanceIncidents: maintenanceHistory.filter(
        (m) => m.action === "maintenance_started",
      ).length,
      totalRequests: requests.length,
      approvedRequests: requests.filter((r) => r.status === "approved").length,
      rejectedRequests: requests.filter((r) => r.status === "rejected").length,
    };

    /* ===============================
       7. PDF GENERATION
       =============================== */
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=user-${user._id}-full-report.pdf`,
    );

    doc.pipe(res);

    /* ---------- HEADER ---------- */
    doc
      .fontSize(18)
      .text("Company Name", { align: "center" })
      .moveDown(0.5)
      .fontSize(14)
      .text("ALLOC8 – Asset Management System", { align: "center" })
      .moveDown(1)
      .fontSize(16)
      .text("User Full Asset Report", { align: "center" })
      .moveDown(2);

    /* ---------- EMPLOYEE DETAILS ---------- */
    doc.fontSize(12).text("Employee Information", { underline: true });
    doc.moveDown(0.5);

    doc.text(`Employee Name : ${user.name}`);
    doc.text(`Email         : ${user.email}`);
    doc.text(`Role          : ${user.role}`);
    doc.text(`Department    : ${user.department || "-"}`);
    doc.text(`Phone         : ${user.phone || "-"}`);
    doc.text(`Status        : ${user.isDeleted ? "Inactive" : "Active"}`);
    doc.text(
      `Joined On     : ${new Date(user.createdAt).toLocaleDateString()}`,
    );

    if (user.isDeleted && user.deletedAt) {
      doc.text(
        `Resigned On   : ${new Date(user.deletedAt).toLocaleDateString()}`,
      );
    }

    doc.moveDown(0.5);
    doc.text("----------------------------------------");
    doc.moveDown(1);

    /* ---------- CURRENT ASSETS ---------- */
    doc.text("Current Assigned Assets", { underline: true });
    doc.moveDown(0.5);

    if (currentAssets.length === 0) {
      doc.text("No assets currently assigned.");
    } else {
      currentAssets.forEach((a, i) => {
        doc.text(`${i + 1}. ${a.name}`);
        doc.text(`   Category : ${a.category}`);
        doc.text(`   Serial   : ${a.serialNumber || "-"}`);
        doc.text(`   Status   : ${a.status.toUpperCase()}`);
        doc.moveDown(0.5);
      });
    }

    doc.addPage();

    /* ---------- ASSIGNMENT HISTORY ---------- */
    doc.text("Asset Assignment History", { underline: true });
    doc.moveDown(0.5);

    if (assignmentHistory.length === 0) {
      doc.text("No assignment history found.");
    } else {
      assignmentHistory.forEach((h) => {
        doc.text(
          `${h.assetName} (${h.serialNumber}) | ${new Date(
            h.from,
          ).toLocaleString()} → ${
            h.to ? new Date(h.to).toLocaleString() : "Present"
          }`,
        );
      });
    }

    doc.moveDown(1);

    /* ---------- MAINTENANCE HISTORY ---------- */
    doc.text("Maintenance / Issue History", { underline: true });
    doc.moveDown(0.5);

    if (maintenanceHistory.length === 0) {
      doc.text("No maintenance records found.");
    } else {
      maintenanceHistory.forEach((m) => {
        doc.text(
          `${m.asset?.name || "-"} | ${m.notes || "-"} | ${new Date(
            m.createdAt,
          ).toLocaleString()}`,
        );
      });
    }

    doc.addPage();

    /* ---------- REQUEST HISTORY ---------- */
    doc.text("Asset Request History", { underline: true });
    doc.moveDown(0.5);

    if (requests.length === 0) {
      doc.text("No asset requests found.");
    } else {
      requests.forEach((r) => {
        doc.text(
          `${r.assetCategory} | ${r.status.toUpperCase()} | ${
            r.reason || "-"
          } | ${new Date(r.createdAt).toLocaleString()}`,
        );
        if (r.status === "rejected" && r.rejectionReason) {
          doc.text(`   Rejection Reason: ${r.rejectionReason}`);
        }
      });
    }

    doc.moveDown(1);

    /* ---------- SUMMARY ---------- */
    doc.text("Summary", { underline: true });
    doc.text(`Total Assignments      : ${summary.totalAssignments}`);
    doc.text(`Active Assets          : ${summary.activeAssets}`);
    doc.text(`Maintenance Incidents  : ${summary.maintenanceIncidents}`);
    doc.text(`Total Requests         : ${summary.totalRequests}`);
    doc.text(`Approved Requests      : ${summary.approvedRequests}`);
    doc.text(`Rejected Requests      : ${summary.rejectedRequests}`);

    doc.moveDown(2);

    /* ---------- FOOTER ---------- */
    doc
      .fontSize(9)
      .text(
        `Generated on ${new Date().toLocaleString()} | Generated by ${
          req.user.name
        } (${req.user.email})`,
        { align: "center" },
      );

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate report" });
  }
};
