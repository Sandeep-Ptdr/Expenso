const rateLimit = require("express-rate-limit");
const env = require("../config/env");

const createRateLimiter = ({ windowMs, max, message }) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });
};

const apiLimiter = createRateLimiter({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMaxRequests,
  message: "Too many requests from this IP. Please try again later.",
});

const authLimiter = createRateLimiter({
  windowMs: env.rateLimitWindowMs,
  max: env.authRateLimitMaxRequests,
  message: "Too many authentication attempts. Please try again later.",
});

module.exports = {
  apiLimiter,
  authLimiter,
};
