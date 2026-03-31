const express = require("express");
const {
  register,
  login,
  getCurrentUser,
} = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authLimiter } = require("../middlewares/rate-limit.middleware");
const { validateRequest } = require("../middlewares/validate-request.middleware");
const {
  registerValidation,
  loginValidation,
} = require("../validations/auth.validation");

const router = express.Router();

router.post("/register", authLimiter, registerValidation, validateRequest, register);
router.post("/login", authLimiter, loginValidation, validateRequest, login);
router.get("/me", protect, getCurrentUser);

module.exports = router;
