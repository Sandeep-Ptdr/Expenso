const express = require("express");
const {
  askAssistant,
  getMonthlyInsights,
  parseTransactionText,
  transcribeAudio,
} = require("../controllers/ai.controller");
const { protect } = require("../middlewares/auth.middleware");
const { validateRequest } = require("../middlewares/validate-request.middleware");
const {
  askAssistantValidation,
  monthlyInsightsValidation,
  parseTransactionTextValidation,
  transcribeAudioValidation,
} = require("../validations/ai.validation");

const router = express.Router();

router.use(protect);

router.post("/ask", askAssistantValidation, validateRequest, askAssistant);
router.post(
  "/monthly-insights",
  monthlyInsightsValidation,
  validateRequest,
  getMonthlyInsights
);
router.post(
  "/transcribe-audio",
  transcribeAudioValidation,
  validateRequest,
  transcribeAudio
);
router.post(
  "/parse-transaction",
  parseTransactionTextValidation,
  validateRequest,
  parseTransactionText
);

module.exports = router;
