const rateLimit = require("express-rate-limit");

const otpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 3, 
  message: "Too many requests, try again later"
});

module.exports = otpLimiter;
