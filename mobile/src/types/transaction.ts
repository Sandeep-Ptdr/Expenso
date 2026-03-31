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
