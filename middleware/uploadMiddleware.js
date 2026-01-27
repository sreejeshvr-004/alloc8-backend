import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = "uploads/assets";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png|webp/i;
  if (allowed.test(file.mimetype)) cb(null, true);
  else cb(new Error("Images only"), false);
};

export const uploadAssetImages = multer({
  storage,
  fileFilter,
}).array("images", 5);
