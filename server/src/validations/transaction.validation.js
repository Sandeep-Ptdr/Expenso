const { body, param, query } = require("express-validator");

const transactionTypeValues = ["income", "expense", "transfer"];
const paymentMethodValues = ["cash", "online"];

const normalizeText = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim();
};

const createTransactionValidation = [
  body("type")
    .trim()
    .notEmpty()
    .withMessage("Type is required.")
    .isIn(transactionTypeValues)
    .withMessage("Type must be one of: income, expense, transfer."),
  body("amount")
    .notEmpty()
    .withMessage("Amount is required.")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a number greater than 0.")
    .toFloat(),
  body("category")
    .customSanitizer(normalizeText)
    .notEmpty()
    .withMessage("Category is required.")
    .isLength({ max: 50 })
    .withMessage("Category cannot exceed 50 characters."),
  body("paymentMethod")
    .trim()
    .notEmpty()
    .withMessage("Payment method is required.")
    .isIn(paymentMethodValues)
    .withMessage("Payment method must be either cash or online."),
  body("description")
    .optional()
    .customSanitizer(normalizeText)
    .isLength({ max: 250 })
    .withMessage("Description cannot exceed 250 characters."),
  body("date")
    .notEmpty()
    .withMessage("Transaction date is required.")
    .isISO8601()
    .withMessage("A valid transaction date is required.")
    .toDate(),
  body("person")
    .optional()
    .customSanitizer(normalizeText)
    .isLength({ max: 100 })
    .withMessage("Person cannot exceed 100 characters."),
  body("person").custom((value, { req }) => {
    if (req.body.type === "transfer" && !String(value || "").trim()) {
      throw new Error("Person is required for transfer transactions.");
    }

    return true;
  }),
];

const updateTransactionValidation = [
  param("transactionId").isMongoId().withMessage("Invalid transaction id."),
  body("type")
    .optional()
    .trim()
    .isIn(transactionTypeValues)
    .withMessage("Type must be one of: income, expense, transfer."),
  body("amount")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a number greater than 0.")
    .toFloat(),
  body("category")
    .optional()
    .customSanitizer(normalizeText)
    .notEmpty()
    .withMessage("Category cannot be empty.")
    .isLength({ max: 50 })
    .withMessage("Category cannot exceed 50 characters."),
  body("paymentMethod")
    .optional()
    .trim()
    .isIn(paymentMethodValues)
    .withMessage("Payment method must be either cash or online."),
  body("description")
    .optional()
    .customSanitizer(normalizeText)
    .isLength({ max: 250 })
    .withMessage("Description cannot exceed 250 characters."),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("A valid transaction date is required.")
    .toDate(),
  body("person")
    .optional()
    .customSanitizer(normalizeText)
    .isLength({ max: 100 })
    .withMessage("Person cannot exceed 100 characters."),
];

const getTransactionsValidation = [
  query("category")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category filter cannot be empty."),
  query("type")
    .optional()
    .trim()
    .isIn(transactionTypeValues)
    .withMessage("Type filter must be one of: income, expense, transfer."),
  query("paymentMethod")
    .optional()
    .trim()
    .isIn(paymentMethodValues)
    .withMessage("Payment method filter must be either cash or online."),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("startDate must be a valid date.")
    .toDate(),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("endDate must be a valid date.")
    .toDate(),
];

const transactionIdValidation = [
  param("transactionId").isMongoId().withMessage("Invalid transaction id."),
];

module.exports = {
  createTransactionValidation,
  updateTransactionValidation,
  getTransactionsValidation,
  transactionIdValidation,
};
