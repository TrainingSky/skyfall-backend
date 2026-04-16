const express = require("express");

const {
  createTestimonial,
  getTestimonials,
  updateTestimonial,
  deleteTestimonial
} = require("../controllers/testimonialController");

const upload = require("../config/cloudinary");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// public
router.get("/", getTestimonials);

//admin
router.post("/", protect, adminOnly, upload.single("avatar"), createTestimonial);
router.put("/:id", protect, adminOnly, upload.single("avatar"), updateTestimonial);
router.delete("/:id", protect, adminOnly, deleteTestimonial);

module.exports = router;
