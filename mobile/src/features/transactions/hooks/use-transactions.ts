import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { useTransactionStore } from "@/store/transaction-store";

export const useTransactions = () => {
  const fetchFilteredTransactions = useTransactionStore(
    (state) => state.fetchFilteredTransactions
  );
  const transactions = useTransactionStore((state) => state.filteredTransactions);
  const isLoading = useTransactionStore((state) => state.isFilteredLoading);
  const error = useTransactionStore((state) => state.filteredError);
  const filters = useTransactionStore((state) => state.filters);
  const queryKey = JSON.stringify(filters);

  const loadTransactions = useCallback(async () => {
    await fetchFilteredTransactions();
  }, [fetchFilteredTransactions, queryKey]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  return {
    transactions,
    isLoading,
    error,
    filters,
    reload: loadTransactions,
  };
};
