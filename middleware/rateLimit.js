const rateLimit = require("express-rate-limit");

const otpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 3, // max 3 requests per minute
  message: "Too many requests, try again later"
});

module.exports = otpLimiter;
