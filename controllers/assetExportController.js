import PDFDocument from "pdfkit";
import Asset from "../models/assetModel.js";
import AssetHistory from "../models/assetHistoryModel.js";

export const exportAssetHistoryPDF = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const history = await AssetHistory.find({ asset: asset._id })
      .populate("performedBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: 1 });

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${asset.name}-history.pdf`
    );

    doc.pipe(res);

    doc.fontSize(18).text("Asset History Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Asset Name: ${asset.name}`);
    doc.text(`Category: ${asset.category}`);
    doc.text(`Serial No: ${asset.serialNumber || "N/A"}`);
    doc.moveDown();

    history.forEach((h, i) => {
      doc
        .fontSize(11)
        .text(
          `${i + 1}. ${h.action.toUpperCase()} | ${
            h.createdAt.toISOString().split("T")[0]
          }`
        );

      doc.text(`   Performed By: ${h.performedBy?.name || "System"}`);

      if (h.assignedTo) {
        doc.text(`   Assigned To: ${h.assignedTo.name}`);
      }

      if (h.notes) {
        doc.text(`   Notes: ${h.notes}`);
      }

      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
