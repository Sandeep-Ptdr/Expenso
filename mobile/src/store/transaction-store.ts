import { create } from "zustand";

import { ApiError } from "@/services/api/http";
import { transactionsService } from "@/services/transactions/transactions.service";
import { useAuthStore } from "@/store/auth-store";
import type {
  CreateTransactionPayload,
  Transaction,
  TransactionFilters,
} from "@/types/transaction";

const defaultFilters: TransactionFilters = {
  category: "",
  type: "",
  paymentMethod: "",
  startDate: "",
  endDate: "",
};

const matchesFilter = (transaction: Transaction, filters: TransactionFilters) => {
  if (filters.category) {
    const category = filters.category.trim().toLowerCase();

    if (transaction.category.trim().toLowerCase() !== category) {
      return false;
    }
  }

  if (filters.type && transaction.type !== filters.type) {
    return false;
  }

  if (filters.paymentMethod && transaction.paymentMethod !== filters.paymentMethod) {
    return false;
  }

  const transactionDate = new Date(transaction.date).getTime();

  if (filters.startDate) {
    const startDate = new Date(filters.startDate).getTime();

    if (transactionDate < startDate) {
      return false;
    }
  }

  if (filters.endDate) {
    const endDate = new Date(filters.endDate).getTime();

    if (transactionDate > endDate) {
      return false;
    }
  }

  return true;
};

type TransactionStore = {
  overviewTransactions: Transaction[];
  filteredTransactions: Transaction[];
  filters: TransactionFilters;
  isOverviewLoading: boolean;
  isFilteredLoading: boolean;
  isCreating: boolean;
  overviewError: string;
  filteredError: string;
  createError: string;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  clearFilters: () => void;
  reset: () => void;
  fetchOverviewTransactions: () => Promise<void>;
  fetchFilteredTransactions: () => Promise<void>;
  createTransaction: (payload: CreateTransactionPayload) => Promise<void>;
};

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  overviewTransactions: [],
  filteredTransactions: [],
  filters: defaultFilters,
  isOverviewLoading: true,
  isFilteredLoading: true,
  isCreating: false,
  overviewError: "",
  filteredError: "",
  createError: "",

  setFilters: (filters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    }));
  },

  clearFilters: () => {
    set({ filters: defaultFilters });
  },

  reset: () => {
    set({
      overviewTransactions: [],
      filteredTransactions: [],
      filters: defaultFilters,
      isOverviewLoading: true,
      isFilteredLoading: true,
      isCreating: false,
      overviewError: "",
      filteredError: "",
      createError: "",
    });
  },

  fetchOverviewTransactions: async () => {
    const token = useAuthStore.getState().token;

    if (!token) {
      set({
        overviewTransactions: [],
        isOverviewLoading: false,
        overviewError: "",
      });
      return;
    }

    try {
      set({ isOverviewLoading: true, overviewError: "" });
      const response = await transactionsService.getTransactions(token);

      set({
        overviewTransactions: response.data.transactions,
        isOverviewLoading: false,
      });
    } catch (error) {
      set({
        isOverviewLoading: false,
        overviewError:
          error instanceof ApiError
            ? error.message
            : "Unable to load transactions right now.",
      });
    }
  },

  fetchFilteredTransactions: async () => {
    const token = useAuthStore.getState().token;
    const { filters } = get();

    if (!token) {
      set({
        filteredTransactions: [],
        isFilteredLoading: false,
        filteredError: "",
      });
      return;
    }

    try {
      set({ isFilteredLoading: true, filteredError: "" });
      const response = await transactionsService.getTransactions(token, filters);

      set({
        filteredTransactions: response.data.transactions,
        isFilteredLoading: false,
      });
    } catch (error) {
      set({
        isFilteredLoading: false,
        filteredError:
          error instanceof ApiError
            ? error.message
            : "Unable to load transactions right now.",
      });
    }
  },

  createTransaction: async (payload) => {
    const token = useAuthStore.getState().token;

    if (!token) {
      throw new ApiError("Your session has expired. Please sign in again.", 401);
    }

    try {
      set({ isCreating: true, createError: "" });
      const response = await transactionsService.createTransaction(token, payload);
      const createdTransaction = response.data.transaction;
      const { filters, filteredTransactions, overviewTransactions } = get();

      set({
        overviewTransactions: [createdTransaction, ...overviewTransactions],
        filteredTransactions: matchesFilter(createdTransaction, filters)
          ? [createdTransaction, ...filteredTransactions]
          : filteredTransactions,
        isCreating: false,
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Unable to save this transaction right now.";

      set({
        isCreating: false,
        createError: message,
      });

      throw error;
    }
  },
}));
