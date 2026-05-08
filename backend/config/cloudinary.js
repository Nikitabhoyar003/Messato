const cloudinary = require("cloudinary").v2;

/* =========================
   CHECK ENV VARIABLES
========================= */

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {

  console.error("❌ CLOUDINARY ENV VARIABLES MISSING");

  console.log("CLOUDINARY_CLOUD_NAME 👉", process.env.CLOUDINARY_CLOUD_NAME);
  console.log("CLOUDINARY_API_KEY 👉", process.env.CLOUDINARY_API_KEY);
  console.log(
    "CLOUDINARY_API_SECRET 👉",
    process.env.CLOUDINARY_API_SECRET ? "FOUND" : "MISSING"
  );
}

/* =========================
   CLOUDINARY CONFIG
========================= */

cloudinary.config({

  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,

  api_key: process.env.CLOUDINARY_API_KEY,

  api_secret: process.env.CLOUDINARY_API_SECRET,

  secure: true,

});

/* =========================
   TEST CONFIG
========================= */

console.log("☁️ Cloudinary Config Loaded Successfully");
console.log("☁️ Cloud Name 👉", process.env.CLOUDINARY_CLOUD_NAME);

/* =========================
   EXPORT
========================= */

module.exports = cloudinary;