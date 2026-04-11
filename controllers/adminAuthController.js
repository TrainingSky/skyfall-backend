const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const AdminOtp = require("../models/AdminOtp");

// ================= LOGIN =================
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.role !== "admin") {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({ message: "Please verify your email" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= REGISTER (email + password → sends OTP) =================
const registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);

    await AdminOtp.findOneAndUpdate(
      { email },
      { otp, expiresAt, password: hashedPassword },
      { upsert: true, returnDocument: "after" }
    );

    await sendEmail(
      email,
      "Admin OTP Verification",
      `Your OTP is: ${otp}. It expires in 5 minutes.`
    );

    res.json({ message: "OTP sent to your email. Please verify." });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= VERIFY OTP → CREATE ADMIN =================
const verifyAndCreateAdmin = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const data = await AdminOtp.findOne({ email });

    if (!data) {
      return res.status(400).json({ message: "Please register first" });
    }

    if (Date.now() > data.expiresAt) {
      await AdminOtp.deleteOne({ email });
      return res.status(400).json({ message: "OTP expired, please register again" });
    }

    if (data.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await User.create({
      name: "Admin",
      email,
      password: data.password, // already hashed
      role: "admin",
      isEmailVerified: true,
    });

    await AdminOtp.deleteOne({ email });

    res.json({ message: "Admin created successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= FORGOT PASSWORD (sends OTP) =================
const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await AdminOtp.findOneAndUpdate(
      { email },
      { otp, expiresAt, password: user.password }, // keep existing password
      { upsert: true, returnDocument: "after" }
    );

    await sendEmail(email, "Password Reset OTP", `Your OTP is: ${otp}. It expires in 5 minutes.`);

    res.json({ message: "Reset OTP sent" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= RESET PASSWORD =================
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const data = await AdminOtp.findOne({ email });

    if (!data) {
      return res.status(400).json({ message: "Please request an OTP first" });
    }

    if (Date.now() > data.expiresAt) {
      await AdminOtp.deleteOne({ email });
      return res.status(400).json({ message: "OTP expired, please try again" });
    }

    if (data.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    await AdminOtp.deleteOne({ email });

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= EXPORT =================
module.exports = {
  loginAdmin,
  registerAdmin,
  verifyAndCreateAdmin,
  sendResetOtp,
  resetPassword,
};