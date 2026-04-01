import { http } from "@/services/api/http";
import type {
  CreateTransactionPayload,
  TransactionFilters,
  TransactionListResponse,
  TransactionResponse,
} from "@/types/transaction";

const buildQueryString = (filters: TransactionFilters) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const query = params.toString();

  return query ? `?${query}` : "";
};

export const transactionsService = {
  getTransactions(token: string, filters: TransactionFilters = {}) {
    return http<TransactionListResponse>(
      `/transactions${buildQueryString(filters)}`,
      { token }
    );
  },

  createTransaction(token: string, payload: CreateTransactionPayload) {
    return http<TransactionResponse>("/transactions", {
      method: "POST",
      token,
      body: payload,
    });
  },

  deleteTransaction(token: string, transactionId: string) {
    return http<{ success: boolean; message: string }>(
      `/transactions/${transactionId}`,
      {
        method: "DELETE",
        token,
      }
    );
  },
};
