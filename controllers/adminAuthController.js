const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const AdminOtp = require("../models/AdminOtp");
const Joi = require("joi");

/* Joi schemas*/

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const otpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

const emailSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  newPassword: Joi.string().min(8).required(),
});






const loginAdmin = async (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).setOptions({
      sanitizeFilter: true,
    });

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
    console.error(error);
    next(error);
  }
};

const registerAdmin = async (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;

  try {
    const existing = await User.findOne({ email }).setOptions({
      sanitizeFilter: true,
    });

    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);

    await AdminOtp.findOneAndUpdate(
      { email },
      { otp: hashedOtp, expiresAt, password: hashedPassword },
      { upsert: true, returnDocument: "after" }
    );

    await sendEmail(
      email,
      "Admin OTP Verification",
      `Your OTP is: ${otp}. It expires in 5 minutes.`
    );

    res.json({ message: "OTP sent to your email. Please verify." });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const verifyAndCreateAdmin = async (req, res, next) => {
  const { error } = otpSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, otp } = req.body;

  try {
    const data = await AdminOtp.findOne({ email }).setOptions({
      sanitizeFilter: true,
    });

    if (!data) {
      return res.status(400).json({ message: "Please register first" });
    }

    if (Date.now() > data.expiresAt) {
      await AdminOtp.deleteOne({ email });
      return res
        .status(400)
        .json({ message: "OTP expired, please register again" });
    }

    const isOtpValid = await bcrypt.compare(otp, data.otp);

    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await User.create({
      name: "Admin",
      email,
      password: data.password,
      role: "admin",
      isEmailVerified: true,
    });

    await AdminOtp.deleteOne({ email });

    res.json({ message: "Admin created successfully" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const sendResetOtp = async (req, res, next) => {
  const { error } = emailSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email }).setOptions({
      sanitizeFilter: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await AdminOtp.findOneAndUpdate(
      { email },
      { otp: hashedOtp, expiresAt, password: user.password },
      { upsert: true, returnDocument: "after" }
    );

    await sendEmail(
      email,
      "Password Reset OTP",
      `Your OTP is: ${otp}. It expires in 5 minutes.`
    );

    res.json({ message: "Reset OTP sent" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  const { error } = resetSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, otp, newPassword } = req.body;

  try {
    const data = await AdminOtp.findOne({ email }).setOptions({
      sanitizeFilter: true,
    });

    if (!data) {
      return res
        .status(400)
        .json({ message: "Please request an OTP first" });
    }

    if (Date.now() > data.expiresAt) {
      await AdminOtp.deleteOne({ email });
      return res
        .status(400)
        .json({ message: "OTP expired, please try again" });
    }

    const isOtpValid = await bcrypt.compare(otp, data.otp);

    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    );

    await AdminOtp.deleteOne({ email });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = {
  loginAdmin,
  registerAdmin,
  verifyAndCreateAdmin,
  sendResetOtp,
  resetPassword,
};