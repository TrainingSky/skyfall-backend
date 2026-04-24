const rateLimit = require("express-rate-limit");

const otpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 3,
  message: {
    message: "Too many OTP requests, please try again after 1 minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
});

module.exports = otpLimiter;