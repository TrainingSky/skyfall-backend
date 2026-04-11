// models/AdminOtp.js
const mongoose = require("mongoose");

const adminOtpSchema = new mongoose.Schema({
  email:     { type: String, required: true },
  otp:       { type: String, required: true },
  expiresAt: { type: Date,   required: true },
  password:  { type: String, required: true },
});

module.exports = mongoose.model("AdminOtp", adminOtpSchema);