const express = require("express");

const {
  createProject,
  getProjects,
  updateProject,
  deleteProject
} = require("../controllers/projectController");

const upload = require("../config/cloudinary");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// ================= PUBLIC =================
router.get("/", getProjects);

// ================= ADMIN ONLY =================

// create project (with upload)
router.post(
  "/create",
  protect,
  adminOnly,
  (req, res, next) => {
    upload.array("images", 4)(req, res, function (err) {
      if (err) {
        console.error("UPLOAD ERROR:", err);

        return res.status(500).json({
          message: "Upload failed",
          error: err.message || err
        });
      }
      next();
    });
  },
  createProject
);

// update project
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.array("images", 4),
  updateProject
);

// delete project
router.delete(
  "/delete/:id",
  protect,
  adminOnly,
  deleteProject
);

module.exports = router;
