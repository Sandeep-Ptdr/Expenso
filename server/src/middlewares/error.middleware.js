const mongoose = require("mongoose");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error.";

  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
  }

  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid value provided for ${err.path}.`;
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = {
  errorHandler,
};
