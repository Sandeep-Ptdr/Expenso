const express = require("express");
const aiRoutes = require("./ai.routes");
const authRoutes = require("./auth.routes");
const healthRoutes = require("./health.routes");
const transactionRoutes = require("./transaction.routes");

const router = express.Router();

router.use("/ai", aiRoutes);
router.use("/auth", authRoutes);
router.use("/health", healthRoutes);
router.use("/transactions", transactionRoutes);

module.exports = router;
