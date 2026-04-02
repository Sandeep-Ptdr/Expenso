const AppError = require("../utils/app-error");
const env = require("../config/env");
const AssistantConversation = require("../models/assistant-conversation.model");
const Transaction = require("../models/transaction.model");

const OPENROUTER_API_URL =
  "https://openrouter.ai/api/v1/chat/completions";
const MAX_STORED_MESSAGES = 20;

const parseJsonResponse = (content) => {
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new AppError("AI returned an invalid response format.", 502);
  }
};

const extractOpenRouterText = (response) => {
  const content = response?.choices?.[0]?.message?.content;

  if (typeof content === "string" && content.trim()) {
    return content.trim();
  }

  if (Array.isArray(content)) {
    const text = content
      .map((item) => item?.text)
      .filter((value) => typeof value === "string" && value.trim())
      .join("");

    if (text && text.trim()) {
      return text.trim();
    }
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

const summarizeTransactions = (transactions) => {
  const totals = transactions.reduce(
    (summary, transaction) => {
      if (transaction.type === "income") {
        summary.income += transaction.amount;
        summary.paymentMethod.income[transaction.paymentMethod] += transaction.amount;
        summary.paymentMethod.net[transaction.paymentMethod] += transaction.amount;
      }

      if (transaction.type === "expense") {
        summary.expense += transaction.amount;
        summary.outgoing += transaction.amount;
        summary.paymentMethod.outgoing[transaction.paymentMethod] +=
          transaction.amount;
        summary.paymentMethod.net[transaction.paymentMethod] -= transaction.amount;
      }

      if (transaction.type === "transfer") {
        summary.transfer += transaction.amount;
        summary.outgoing += transaction.amount;
        summary.paymentMethod.outgoing[transaction.paymentMethod] +=
          transaction.amount;
        summary.paymentMethod.net[transaction.paymentMethod] -= transaction.amount;
      }
      summary.byType[transaction.type] += 1;

      if (
        transaction.type === "expense" ||
        transaction.type === "transfer"
      ) {
        summary.outgoingCategories[transaction.category] =
          (summary.outgoingCategories[transaction.category] || 0) +
          transaction.amount;
      }

      if (transaction.type === "income") {
        summary.incomeCategories[transaction.category] =
          (summary.incomeCategories[transaction.category] || 0) +
          transaction.amount;
      }

      return summary;
    },
    {
      income: 0,
      expense: 0,
      transfer: 0,
      outgoing: 0,
      paymentMethod: {
        income: {
          cash: 0,
          online: 0,
        },
        outgoing: {
          cash: 0,
          online: 0,
        },
        net: {
          cash: 0,
          online: 0,
        },
      },
      byType: {
        income: 0,
        expense: 0,
        transfer: 0,
      },
      outgoingCategories: {},
      incomeCategories: {},
    }
  );

  return {
    ...totals,
    balance: totals.income - totals.outgoing,
    transactionCount: transactions.length,
    dateRange:
      transactions.length > 0
        ? {
            newest: transactions[0].date,
            oldest: transactions[transactions.length - 1].date,
          }
        : null,
    topOutgoingCategories: Object.entries(totals.outgoingCategories)
      .map(([category, total]) => ({ category, total }))
      .sort((left, right) => right.total - left.total)
      .slice(0, 5),
    topIncomeCategories: Object.entries(totals.incomeCategories)
      .map(([category, total]) => ({ category, total }))
      .sort((left, right) => right.total - left.total)
      .slice(0, 5),
  };
};

const normalizeConversationMessages = (messages) => {
  return (messages || []).map((message) => ({
    id: String(message._id),
    role: message.role,
    content: message.content,
    createdAt: message.createdAt,
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

const mapMimeTypeToOpenRouterAudioFormat = (mimeType) => {
  const normalizedMimeType = String(mimeType || "").toLowerCase();

  if (normalizedMimeType.includes("wav")) {
    return "wav";
  }

  if (
    normalizedMimeType.includes("mpeg") ||
    normalizedMimeType.includes("mp3") ||
    normalizedMimeType.includes("aac") ||
    normalizedMimeType.includes("mp4") ||
    normalizedMimeType.includes("m4a")
  ) {
    return "mp3";
  }

  if (normalizedMimeType.includes("webm")) {
    return "mp3";
  }

  return "mp3";
};

const generateOpenRouterCompletion = async ({
  messages,
  model,
  responseFormat,
}) => {
  if (!env.openRouterApiKey) {
    throw new AppError(
      "OpenRouter AI is not configured. Add OPENROUTER_API_KEY on the server.",
      503
    );
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.openRouterApiKey}`,
  };

  if (env.openRouterSiteUrl) {
    headers["HTTP-Referer"] = env.openRouterSiteUrl;
  }

  if (env.openRouterAppName) {
    headers["X-Title"] = env.openRouterAppName;
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: model || env.openRouterModel,
      messages,
      temperature: 0.2,
      ...(responseFormat ? { response_format: responseFormat } : {}),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.error?.message ||
      "OpenRouter request failed while generating a response.";

    throw new AppError(message, response.status || 502);
  }

  return extractOpenRouterText(data);
};

const getAssistantConversation = async ({ userId }) => {
  const conversation = await AssistantConversation.findOne({
    user: userId,
  }).lean();

  return {
    messages: normalizeConversationMessages(conversation?.messages || []),
  };
};

const clearAssistantConversation = async ({ userId }) => {
  await AssistantConversation.findOneAndUpdate(
    { user: userId },
    { $set: { messages: [] } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return {
    messages: [],
  };
};

const transcribeAudio = async ({ audioBase64, mimeType }) => {
  return generateOpenRouterCompletion({
    model: env.openRouterAudioModel,
    messages: [
      {
        role: "system",
        content:
          "You transcribe short expense-tracker voice notes into clean text. " +
          "Return only the transcript text. " +
          "Keep rupee amounts, names, dates, categories, and payment method words exactly when possible. " +
          "Prefer words like cash, online, lunch, salary, rent, transfer, food, shopping, transport, and bill when they are spoken. " +
          "If the speaker says a number, preserve it as digits whenever possible. " +
          "Do not add commentary or labels.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "Transcribe this expense tracking voice note accurately. " +
              "Preserve names, rupee amounts, dates, and words like cash, online, lunch, salary, rent, transfer, food, shopping, transport, and bill.",
          },
          {
            type: "input_audio",
            input_audio: {
              data: audioBase64,
              format: mapMimeTypeToOpenRouterAudioFormat(mimeType),
            },
          },
        ],
      },
    ],
  });
};

const parseTransactionText = async ({ text, timezone }) => {
  const today = new Date().toISOString().slice(0, 10);
  const parsedTransaction = parseJsonResponse(
    await generateOpenRouterCompletion({
      messages: [
        {
          role: "system",
          content:
            "You extract structured expense tracker transactions from natural language. Return valid JSON only with this exact shape: " +
            '{"type":string|null,"amount":number|null,"category":string|null,"paymentMethod":string|null,"description":string,"date":string|null,"person":string,"confidence":number|null,"missingFields":string[]}. ' +
            'Allowed "type" values: income, expense, transfer. Allowed "paymentMethod" values: cash, online. ' +
            "Use null when a field cannot be determined confidently. " +
            "For phrases like today, resolve them using the provided timezone and current date. " +
            "Choose a practical category like Food, Salary, Transport, Rent, Bills, Shopping, Transfer, or Other. " +
            "If the text contains a clear rupee amount or a clear payment word like cash or online, preserve it accurately.",
        },
        {
          role: "user",
          content:
            `Timezone: ${timezone}\n` +
            `Current date: ${today}\n` +
            `Transaction text: ${text}`,
        },
      ],
      responseFormat: { type: "json_object" },
    })
  );

  return normalizeParsedTransaction(parsedTransaction);
};

const askAssistant = async ({ userId, question, timezone, resetContext }) => {
  const trimmedQuestion = String(question || "").trim();

  if (!trimmedQuestion) {
    throw new AppError("Question is required.", 400);
  }

  if (resetContext) {
    await clearAssistantConversation({ userId });
  }

  const transactions = await Transaction.find({ user: userId })
    .sort({ date: -1, createdAt: -1 })
    .lean();
  const recentTransactions = transactions.slice(0, 120);
  const transactionSummary = summarizeTransactions(transactions);
  const existingConversation = await AssistantConversation.findOne({
    user: userId,
  });
  const previousMessages = resetContext
    ? []
    : normalizeConversationMessages(existingConversation?.messages || []).slice(
        -12
      );

  const today = new Date().toISOString().slice(0, 10);
  const transactionContext = JSON.stringify(
    formatTransactionsForAssistant(recentTransactions),
    null,
    2
  );
  const transactionSummaryContext = JSON.stringify(transactionSummary, null, 2);
  const conversationMessages = previousMessages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
  const answer = await generateOpenRouterCompletion({
    messages: [
      {
        role: "system",
        content:
          "You are an advanced personal finance assistant for an expense tracker. " +
          "Answer using only the provided transaction history, summary statistics, and prior chat context. " +
          "You remember previous turns in this conversation and should answer follow-up questions consistently. " +
          "Treat transfers as outgoing money sent to another person, not as internal wallet movement. " +
          "Use the full financial context, including income, outgoing money, expenses, transfers, categories, payment methods, cash vs online, dates, trends, and balances. " +
          "If the data is insufficient, say that clearly. " +
          "Do not invent transactions. " +
          "Be practical, precise, and easy to understand. " +
          "When useful, include totals, category names, comparisons, and short explanations.",
      },
      {
        role: "user",
        content:
          `Timezone: ${timezone}\n` +
          `Current date: ${today}\n` +
          `Full transaction summary:\n${transactionSummaryContext}\n\n` +
          `Recent detailed transactions:\n${transactionContext}`,
      },
      ...conversationMessages,
      {
        role: "user",
        content: trimmedQuestion,
      },
    ],
  });

  const nextMessages = [
    ...previousMessages,
    {
      id: `local-user-${Date.now()}`,
      role: "user",
      content: trimmedQuestion,
      createdAt: new Date(),
    },
    {
      id: `local-assistant-${Date.now() + 1}`,
      role: "assistant",
      content: answer,
      createdAt: new Date(),
    },
  ].slice(-MAX_STORED_MESSAGES);

  const persistedConversation = await AssistantConversation.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        messages: nextMessages.map((message) => ({
          role: message.role,
          content: message.content,
          createdAt: message.createdAt,
        })),
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  ).lean();

  return {
    answer,
    transactionsAnalyzed: transactions.length,
    messages: normalizeConversationMessages(persistedConversation?.messages || []),
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
  const transfer = transactions
    .filter((transaction) => transaction.type === "transfer")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const outgoing = expense + transfer;
  const balance = income - outgoing;

  const topCategories = Object.values(
    transactions
      .filter(
        (transaction) =>
          transaction.type === "expense" || transaction.type === "transfer"
      )
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
    await generateOpenRouterCompletion({
      messages: [
        {
          role: "system",
          content:
            "You are a concise finance insights assistant. " +
            'Return valid JSON only with this exact shape: {"headline":string,"summary":string,"suggestion":string}. ' +
            "Use only the provided monthly transaction data. " +
            "Keep each field short and practical.",
        },
        {
          role: "user",
          content:
            `Timezone: ${timezone}\n` +
            `Month: ${targetMonth}\n` +
            `Year: ${targetYear}\n` +
            `Income: ${income}\n` +
            `Expense: ${expense}\n` +
            `Transfer: ${transfer}\n` +
            `Outgoing: ${outgoing}\n` +
            `Balance: ${balance}\n` +
            `Top categories: ${JSON.stringify(topCategories)}\n` +
            `Transactions: ${JSON.stringify(formatTransactionsForAssistant(transactions))}`,
        },
      ],
      responseFormat: { type: "json_object" },
    })
  );

  return {
    month: targetMonth,
    year: targetYear,
    totals: {
      income,
      expense: outgoing,
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
  clearAssistantConversation,
  getAssistantConversation,
  askAssistant,
  getMonthlyInsights,
  parseTransactionText,
  transcribeAudio,
};
