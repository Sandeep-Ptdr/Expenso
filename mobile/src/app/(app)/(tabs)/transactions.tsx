import { useState } from "react";
import { Alert } from "react-native";
import { RefreshControl, ScrollView, Text, View } from "react-native";

import FeedbackCard from "@/components/ui/FeedbackCard";
import FilterChip from "@/components/ui/FilterChip";
import FormInput from "@/components/ui/FormInput";
import LoadingCard from "@/components/ui/LoadingCard";
import Panel from "@/components/ui/Panel";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Screen from "@/components/ui/Screen";
import TransactionCard from "@/features/transactions/components/TransactionCard";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";
import { useTransactionStore } from "@/store/transaction-store";
import type { PaymentMethod, TransactionType } from "@/types/transaction";

export default function TransactionsScreen() {
  const [draftCategory, setDraftCategory] = useState("");
  const [draftType, setDraftType] = useState<TransactionType | "">("");
  const [draftPaymentMethod, setDraftPaymentMethod] = useState<
    PaymentMethod | ""
  >("");
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");
  const { transactions, isLoading, error } = useTransactions();
  const setFilters = useTransactionStore((state) => state.setFilters);
  const clearStoreFilters = useTransactionStore((state) => state.clearFilters);
  const fetchFilteredTransactions = useTransactionStore(
    (state) => state.fetchFilteredTransactions
  );
  const deleteTransaction = useTransactionStore((state) => state.deleteTransaction);
  const isDeleting = useTransactionStore((state) => state.isDeleting);

  const handleDeleteTransaction = (transactionId: string) => {
    Alert.alert(
      "Delete transaction",
      "This entry will be removed permanently.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTransaction(transactionId);
            } catch (error) {
              // Store/UI already handle the failure state.
            }
          },
        },
      ]
    );
  };

  const applyFilters = () => {
    setFilters({
      category: draftCategory.trim(),
      type: draftType,
      paymentMethod: draftPaymentMethod,
      startDate: draftStartDate.trim(),
      endDate: draftEndDate.trim(),
    });

    fetchFilteredTransactions();
  };

  const clearFilters = () => {
    setDraftCategory("");
    setDraftType("");
    setDraftPaymentMethod("");
    setDraftStartDate("");
    setDraftEndDate("");
    clearStoreFilters();
    fetchFilteredTransactions();
  };

  return (
    <Screen padded={false}>
      <ScrollView
        className="flex-1 bg-sand-100"
        contentContainerClassName="gap-6 px-5 py-4"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchFilteredTransactions}
            tintColor="#1f6f5f"
          />
        }
      >
        <View className="gap-2">
          <Text className="text-3xl font-bold text-ink-900">Transactions</Text>
          <Text className="text-base leading-7 text-ink-700">
            Filter by category, type, date, and payment method to understand where
            your money is moving.
          </Text>
        </View>

        <Panel>
          <View className="gap-4">
            <FormInput
              label="Category"
              placeholder="Food, Salary, Rent..."
              value={draftCategory}
              onChangeText={setDraftCategory}
            />

            <View className="gap-2">
              <Text className="text-sm font-semibold text-ink-900">Type</Text>
              <View className="flex-row flex-wrap gap-2">
                {(["income", "expense", "transfer"] as const).map((value) => (
                  <FilterChip
                    key={value}
                    label={value}
                    selected={draftType === value}
                    onPress={() =>
                      setDraftType(draftType === value ? "" : value)
                    }
                  />
                ))}
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-ink-900">
                Payment Method
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {(["cash", "online"] as const).map((value) => (
                  <FilterChip
                    key={value}
                    label={value}
                    selected={draftPaymentMethod === value}
                    onPress={() =>
                      setDraftPaymentMethod(
                        draftPaymentMethod === value ? "" : value
                      )
                    }
                  />
                ))}
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormInput
                  label="Start Date"
                  placeholder="YYYY-MM-DD"
                  autoCapitalize="none"
                  value={draftStartDate}
                  onChangeText={setDraftStartDate}
                />
              </View>
              <View className="flex-1">
                <FormInput
                  label="End Date"
                  placeholder="YYYY-MM-DD"
                  autoCapitalize="none"
                  value={draftEndDate}
                  onChangeText={setDraftEndDate}
                />
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <PrimaryButton label="Apply Filters" onPress={applyFilters} />
              </View>
              <View className="flex-1">
                <PrimaryButton
                  label="Clear"
                  variant="ghost"
                  onPress={clearFilters}
                />
              </View>
            </View>
          </View>
        </Panel>

        <View className="gap-3">
          <Text className="text-lg font-semibold text-ink-900">
            {transactions.length} transaction{transactions.length === 1 ? "" : "s"}
          </Text>

          {isLoading ? (
            <LoadingCard label="Loading matching transactions..." />
          ) : error ? (
            <FeedbackCard
              title="Unable to load transactions"
              message={error}
              tone="error"
              actionLabel="Try Again"
              onAction={fetchFilteredTransactions}
            />
          ) : transactions.length === 0 ? (
            <FeedbackCard
              title="No matching results"
              message="Try broadening your filters or add a new transaction that matches this view."
            />
          ) : (
            transactions.map((transaction) => (
              <TransactionCard
                key={transaction._id}
                transaction={transaction}
                onDelete={handleDeleteTransaction}
                isDeleting={isDeleting}
              />
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
