const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const routes = require("./routes");
const env = require("./config/env");
const logger = require("./utils/logger");
const { notFoundHandler } = require("./middlewares/not-found.middleware");
const { errorHandler } = require("./middlewares/error.middleware");
const { apiLimiter } = require("./middlewares/rate-limit.middleware");

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: env.clientOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(apiLimiter);

// Keep request logging lightweight for now; we can swap in a dedicated logger later.
app.use((req, res, next) => {
  if (env.nodeEnv === "development") {
    logger.info(`${req.method} ${req.originalUrl}`);
  }

  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Expense Manager API is running.",
    data: {
      healthCheck: "/api/health",
    },
  });
});

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
