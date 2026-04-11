const express = require("express");
const {
  createService,
  getServices,
  updateService,
  deleteService
} = require("../controllers/serviceController");
const adminOnly = require("../middleware/adminMiddleware");
const protect = require("../middleware/authMiddleware");

const router = express.Router();


router.get("/", getServices);
router.post("/", protect, adminOnly, createService);
router.put("/:id", protect, adminOnly, updateService);
router.delete("/:id", protect, adminOnly, deleteService);


module.exports = router;
