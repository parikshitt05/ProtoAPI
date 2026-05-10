const rateLimit = require("express-rate-limit");

// Per-IP limiter for mock endpoints
const mockRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 100, // 100 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, slow down." },
});

module.exports = { mockRateLimiter };
