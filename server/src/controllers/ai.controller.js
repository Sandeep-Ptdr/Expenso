const aiService = require("../services/ai.service");

const transcribeAudio = async (req, res, next) => {
  try {
    const transcript = await aiService.transcribeAudio({
      audioBase64: req.body.audioBase64,
      mimeType: req.body.mimeType,
    });

    return res.status(200).json({
      success: true,
      message: "Audio transcribed successfully.",
      data: {
        transcript,
      },
    });
  } catch (error) {
    next(error);
  }
};

const askAssistant = async (req, res, next) => {
  try {
    const assistantResponse = await aiService.askAssistant({
      userId: req.user._id,
      question: String(req.body.question).trim(),
      timezone: req.body.timezone || "Asia/Calcutta",
      resetContext: req.body.resetContext,
    });

    return res.status(200).json({
      success: true,
      message: "Assistant response generated successfully.",
      data: assistantResponse,
    });
  } catch (error) {
    next(error);
  }
};

const getAssistantConversation = async (req, res, next) => {
  try {
    const conversation = await aiService.getAssistantConversation({
      userId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "Assistant conversation loaded successfully.",
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

const clearAssistantConversation = async (req, res, next) => {
  try {
    const conversation = await aiService.clearAssistantConversation({
      userId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "Assistant conversation cleared successfully.",
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

const getMonthlyInsights = async (req, res, next) => {
  try {
    const insights = await aiService.getMonthlyInsights({
      userId: req.user._id,
      timezone: req.body.timezone || "Asia/Calcutta",
      month: req.body.month,
      year: req.body.year,
    });

    return res.status(200).json({
      success: true,
      message: "Monthly insights generated successfully.",
      data: insights,
    });
  } catch (error) {
    next(error);
  }
};

const parseTransactionText = async (req, res, next) => {
  try {
    const parsedTransaction = await aiService.parseTransactionText({
      text: String(req.body.text).trim(),
      timezone: req.body.timezone || "Asia/Calcutta",
    });

    return res.status(200).json({
      success: true,
      message: "Transaction text parsed successfully.",
      data: {
        parsedTransaction,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  clearAssistantConversation,
  getAssistantConversation,
  askAssistant,
  getMonthlyInsights,
  parseTransactionText,
  transcribeAudio,
};
