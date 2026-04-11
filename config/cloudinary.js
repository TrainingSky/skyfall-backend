const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: "raghad",
  api_key: "573217581721226",
  api_secret: "aiIxuiE-gW2zo6Tv4s--kkkOdvc",
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "Skyfall-uploads",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });

module.exports = upload;
module.exports.cloudinary = cloudinary;
