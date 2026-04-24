const express = require("express");

const {
  createContact,
  getContacts,
  deleteContact,
} = require("../controllers/contactController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// Public 
router.post("/", createContact);

// Admin 
router.get("/", protect, adminOnly, getContacts);
router.delete("/:id", protect, adminOnly, deleteContact);

module.exports = router;