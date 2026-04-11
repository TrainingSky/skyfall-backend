const express = require("express");
const {
  loginAdmin,
  registerAdmin,
  verifyAndCreateAdmin,
  sendResetOtp,
  resetPassword
} = require("../controllers/adminAuthController");

const loginLimiter = require("../middleware/loginRateLimit");
const otpLimiter = require("../middleware/rateLimit");

const router = express.Router();

router.post("/login",           loginLimiter, loginAdmin);
router.post("/register",        otpLimiter,   registerAdmin);
router.post("/verify-otp",      otpLimiter,   verifyAndCreateAdmin);
router.post("/forgot-password", otpLimiter,   sendResetOtp);
router.post("/reset-password",  otpLimiter,   resetPassword);

module.exports = router;