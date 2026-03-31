const getHealthStatus = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Expense Manager API is healthy.",
    data: {
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    },
  });
};

module.exports = {
  getHealthStatus,
};
