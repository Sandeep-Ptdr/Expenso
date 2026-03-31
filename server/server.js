require("dotenv").config();

const http = require("http");
const mongoose = require("mongoose");
const app = require("./src/app");
const connectDB = require("./src/config/database");
const env = require("./src/config/env");
const logger = require("./src/utils/logger");

const server = http.createServer(app);

const shutdown = (signal) => {
  logger.warn(`${signal} received. Closing server gracefully.`);

  server.close(async () => {
    try {
      await mongoose.connection.close(false);
      logger.info("MongoDB connection closed.");
      process.exit(0);
    } catch (error) {
      logger.error(`Error during shutdown: ${error.message}`);
      process.exit(1);
    }
  });
};

const startServer = async () => {
  try {
    await connectDB();

    server.listen(env.port, () => {
      logger.info(
        `Server is running on port ${env.port} in ${env.nodeEnv} mode.`
      );
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled promise rejection: ${reason}`);
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  logger.error(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

startServer();
