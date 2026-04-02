export type TransactionType = "income" | "expense" | "transfer";
export type PaymentMethod = "cash" | "online";

export type Transaction = {
  _id: string;
  user: string;
  type: TransactionType;
  amount: number;
  category: string;
  paymentMethod: PaymentMethod;
  description: string;
  date: string;
  person: string;
  createdAt: string;
  updatedAt: string;
};

export type TransactionListResponse = {
  success: boolean;
  message: string;
  results: number;
  data: {
    transactions: Transaction[];
  };
};

export type TransactionResponse = {
  success: boolean;
  message: string;
  data: {
    transaction: Transaction;
  };
};

export type TransactionFilters = {
  category?: string;
  type?: TransactionType | "";
  paymentMethod?: PaymentMethod | "";
  startDate?: string;
  endDate?: string;
};

export type CreateTransactionPayload = {
  type: TransactionType;
  amount: number;
  category: string;
  paymentMethod: PaymentMethod;
  description?: string;
  date: string;
  person?: string;
};

export type ParsedTransaction = {
  type: TransactionType | null;
  amount: number | null;
  category: string | null;
  paymentMethod: PaymentMethod | null;
  description: string;
  date: string | null;
  person: string;
  confidence: number | null;
  missingFields: string[];
};

export type ParseTransactionTextPayload = {
  text: string;
  timezone?: string;
};

export type ParseTransactionTextResponse = {
  success: boolean;
  message: string;
  data: {
    parsedTransaction: ParsedTransaction;
  };
};

export type AskAssistantPayload = {
  question: string;
  timezone?: string;
  resetContext?: boolean;
};

export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type AskAssistantResponse = {
  success: boolean;
  message: string;
  data: {
    answer: string;
    transactionsAnalyzed: number;
    messages: AssistantMessage[];
  };
};

export type AssistantConversationResponse = {
  success: boolean;
  message: string;
  data: {
    messages: AssistantMessage[];
  };
};

export type MonthlyInsight = {
  headline: string;
  summary: string;
  suggestion: string;
};

export type MonthlyInsightCategory = {
  category: string;
  total: number;
};

export type MonthlyInsightsPayload = {
  month?: number;
  year?: number;
  timezone?: string;
};

export type MonthlyInsightsResponse = {
  success: boolean;
  message: string;
  data: {
    month: number;
    year: number;
    totals: {
      income: number;
      expense: number;
      balance: number;
    };
    topCategories: MonthlyInsightCategory[];
    transactionsAnalyzed: number;
    insight: MonthlyInsight;
  };
};

export type TranscribeAudioPayload = {
  audioBase64: string;
  mimeType: string;
};

export type TranscribeAudioResponse = {
  success: boolean;
  message: string;
  data: {
    transcript: string;
  };
};

export type RecordedAudioPayload = {
  base64: string;
  mimeType: string;
};
