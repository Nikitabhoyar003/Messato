const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const uploadPDF = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw",   // ⚠️ PDF ke liye important
      folder: "bills",
    });

    // temp file delete
    fs.unlinkSync(filePath);

    return result.secure_url;
  } catch (err) {
    console.error("❌ Cloudinary PDF upload failed:", err);
    throw err;
  }
};

module.exports = uploadPDF;
