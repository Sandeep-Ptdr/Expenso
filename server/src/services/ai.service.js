const AppError = require("../utils/app-error");
const env = require("../config/env");
const Transaction = require("../models/transaction.model");

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const parseJsonResponse = (content) => {
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new AppError("AI returned an invalid response format.", 502);
  }
};

const extractGeminiText = (response) => {
  const text = response?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter((value) => typeof value === "string" && value.trim())
    .join("");

  if (text && text.trim()) {
    return text.trim();
  }

  throw new AppError("AI response did not include any text output.", 502);
};

const normalizeParsedTransaction = (transaction) => {
  return {
    type: transaction.type || null,
    amount:
      typeof transaction.amount === "number" && Number.isFinite(transaction.amount)
        ? transaction.amount
        : null,
    category: transaction.category || null,
    paymentMethod: transaction.paymentMethod || null,
    description: transaction.description || "",
    date: transaction.date || null,
    person: transaction.person || "",
    confidence:
      typeof transaction.confidence === "number" &&
      Number.isFinite(transaction.confidence)
        ? transaction.confidence
        : null,
    missingFields: Array.isArray(transaction.missingFields)
      ? transaction.missingFields
      : [],
  };
};

const formatTransactionsForAssistant = (transactions) => {
  return transactions.map((transaction) => ({
    type: transaction.type,
    amount: transaction.amount,
    category: transaction.category,
    paymentMethod: transaction.paymentMethod,
    description: transaction.description,
    date: transaction.date,
    person: transaction.person,
  }));
};

const getMonthDateRange = ({ month, year }) => {
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  return {
    startDate,
    endDate,
  };
};

const generateGeminiContent = async ({
  prompt,
  systemInstruction,
  responseMimeType = "text/plain",
  parts,
}) => {
  if (!env.geminiApiKey) {
    throw new AppError(
      "Gemini AI is not configured. Add GEMINI_API_KEY on the server.",
      503
    );
  }

  const response = await fetch(
    `${GEMINI_BASE_URL}/${env.geminiModel}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.geminiApiKey,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: "user",
            parts: parts || [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType,
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.error?.message ||
      "Gemini request failed while generating a response.";

    throw new AppError(message, response.status || 502);
  }

  return extractGeminiText(data);
};

const transcribeAudio = async ({ audioBase64, mimeType }) => {
  return generateGeminiContent({
    systemInstruction:
      "You transcribe short expense-tracker voice notes into clean text. " +
      "Return only the transcript text. " +
      "Keep rupee amounts, names, dates, categories, and payment method words exactly when possible. " +
      "Prefer words like cash, online, lunch, salary, rent, transfer, food, shopping, transport, and bill when they are spoken. " +
      "If the speaker says a number, preserve it as digits whenever possible. " +
      "Do not add commentary or labels.",
    parts: [
      {
        text:
          "Transcribe this expense tracking voice note accurately. " +
          "Preserve names, rupee amounts, dates, and words like cash, online, lunch, salary, rent, transfer, food, shopping, transport, and bill.",
      },
      {
        inlineData: {
          mimeType,
          data: audioBase64,
        },
      },
    ],
  });
};

const parseTransactionText = async ({ text, timezone }) => {
  const today = new Date().toISOString().slice(0, 10);
  const parsedTransaction = parseJsonResponse(
    await generateGeminiContent({
      systemInstruction:
        "You extract structured expense tracker transactions from natural language. Return valid JSON only with this exact shape: " +
        '{"type":string|null,"amount":number|null,"category":string|null,"paymentMethod":string|null,"description":string,"date":string|null,"person":string,"confidence":number|null,"missingFields":string[]}. ' +
        'Allowed "type" values: income, expense, transfer. Allowed "paymentMethod" values: cash, online. ' +
        "Use null when a field cannot be determined confidently. " +
        "For phrases like today, resolve them using the provided timezone and current date. " +
        "Choose a practical category like Food, Salary, Transport, Rent, Bills, Shopping, Transfer, or Other. " +
        "If the text contains a clear rupee amount or a clear payment word like cash or online, preserve it accurately.",
      prompt:
        `Timezone: ${timezone}\n` +
        `Current date: ${today}\n` +
        `Transaction text: ${text}`,
      responseMimeType: "application/json",
    })
  );

  return normalizeParsedTransaction(parsedTransaction);
};

const askAssistant = async ({ userId, question, timezone }) => {
  const transactions = await Transaction.find({ user: userId })
    .sort({ date: -1, createdAt: -1 })
    .limit(250)
    .lean();

  const today = new Date().toISOString().slice(0, 10);
  const transactionContext = JSON.stringify(
    formatTransactionsForAssistant(transactions),
    null,
    2
  );

  return {
    answer: await generateGeminiContent({
      systemInstruction:
        "You are a concise personal finance assistant for an expense tracker. " +
        "Answer using only the provided transaction data. " +
        "If the data is insufficient, say that clearly. " +
        "Do not invent transactions. " +
        "Keep answers practical and short, and when useful include totals and category names.",
      prompt:
        `Timezone: ${timezone}\n` +
        `Current date: ${today}\n` +
        `User question: ${question}\n\n` +
        `Transactions:\n${transactionContext}`,
    }),
    transactionsAnalyzed: transactions.length,
  };
};

const getMonthlyInsights = async ({ userId, timezone, month, year }) => {
  const now = new Date();
  const targetMonth = month || now.getUTCMonth() + 1;
  const targetYear = year || now.getUTCFullYear();
  const { startDate, endDate } = getMonthDateRange({
    month: targetMonth,
    year: targetYear,
  });

  const transactions = await Transaction.find({
    user: userId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .sort({ date: -1, createdAt: -1 })
    .lean();

  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const balance = income - expense;

  const topCategories = Object.values(
    transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((accumulator, transaction) => {
        const existing = accumulator[transaction.category] || {
          category: transaction.category,
          total: 0,
        };

        existing.total += transaction.amount;
        accumulator[transaction.category] = existing;
        return accumulator;
      }, {})
  )
    .sort((left, right) => right.total - left.total)
    .slice(0, 3);
  const insight = parseJsonResponse(
    await generateGeminiContent({
      systemInstruction:
        "You are a concise finance insights assistant. " +
        'Return valid JSON only with this exact shape: {"headline":string,"summary":string,"suggestion":string}. ' +
        "Use only the provided monthly transaction data. " +
        "Keep each field short and practical.",
      prompt:
        `Timezone: ${timezone}\n` +
        `Month: ${targetMonth}\n` +
        `Year: ${targetYear}\n` +
        `Income: ${income}\n` +
        `Expense: ${expense}\n` +
        `Balance: ${balance}\n` +
        `Top categories: ${JSON.stringify(topCategories)}\n` +
        `Transactions: ${JSON.stringify(formatTransactionsForAssistant(transactions))}`,
      responseMimeType: "application/json",
    })
  );

  return {
    month: targetMonth,
    year: targetYear,
    totals: {
      income,
      expense,
      balance,
    },
    topCategories,
    transactionsAnalyzed: transactions.length,
    insight: {
      headline: insight.headline || "Monthly overview",
      summary: insight.summary || "No summary available.",
      suggestion: insight.suggestion || "Keep tracking consistently.",
    },
  };
};

module.exports = {
  askAssistant,
  getMonthlyInsights,
  parseTransactionText,
  transcribeAudio,
};
