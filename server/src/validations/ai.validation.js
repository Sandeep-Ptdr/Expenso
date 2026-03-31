const { body } = require("express-validator");

const parseTransactionTextValidation = [
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Transaction text is required.")
    .isLength({ max: 500 })
    .withMessage("Transaction text must be at most 500 characters long."),
];

const askAssistantValidation = [
  body("question")
    .trim()
    .notEmpty()
    .withMessage("Question is required.")
    .isLength({ max: 500 })
    .withMessage("Question must be at most 500 characters long."),
];

const monthlyInsightsValidation = [
  body("month")
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage("Month must be between 1 and 12.")
    .toInt(),
  body("year")
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage("Year must be between 2000 and 2100.")
    .toInt(),
];

const transcribeAudioValidation = [
  body("audioBase64")
    .notEmpty()
    .withMessage("Audio data is required.")
    .isLength({ max: 12_000_000 })
    .withMessage("Audio payload is too large."),
  body("mimeType")
    .trim()
    .notEmpty()
    .withMessage("Audio mime type is required.")
    .isLength({ max: 100 })
    .withMessage("Audio mime type is too long."),
];

module.exports = {
  askAssistantValidation,
  monthlyInsightsValidation,
  parseTransactionTextValidation,
  transcribeAudioValidation,
};
