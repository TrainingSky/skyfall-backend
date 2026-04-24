const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,

  message: {
    message: "Too many login attempts, please try again after 15 minutes",
  },

  standardHeaders: true,
  legacyHeaders: false,

  statusCode: 429,
});

module.exports = loginLimiter;