import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import FeedbackCard from "@/components/ui/FeedbackCard";
import FilterChip from "@/components/ui/FilterChip";
import FormInput from "@/components/ui/FormInput";
import LoadingCard from "@/components/ui/LoadingCard";
import Panel from "@/components/ui/Panel";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Screen from "@/components/ui/Screen";
import TransactionCard from "@/features/transactions/components/TransactionCard";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";
import { useI18n } from "@/hooks/use-i18n";
import { useTransactionStore } from "@/store/transaction-store";
import type { PaymentMethod, TransactionType } from "@/types/transaction";

const parseDateInputValue = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return new Date();
  }

  return new Date(year, month - 1, day);
};

const formatDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function TransactionsScreen() {
  const { language, t } = useI18n();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState("");
  const [draftType, setDraftType] = useState<TransactionType | "">("");
  const [draftPaymentMethod, setDraftPaymentMethod] = useState<
    PaymentMethod | ""
  >("");
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");
  const [activeDateField, setActiveDateField] = useState<"start" | "end" | null>(
    null
  );
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
      t("transactions.deleteTitle"),
      t("transactions.deleteMessage"),
      [
        {
          text: t("transactions.cancel"),
          style: "cancel",
        },
        {
          text: t("transactions.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTransaction(transactionId);
            } catch {
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

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedValue?: Date
  ) => {
    if (event.type === "dismissed") {
      setActiveDateField(null);
      return;
    }

    if (selectedValue) {
      const formattedDate = formatDateInputValue(selectedValue);

      if (activeDateField === "start") {
        setDraftStartDate(formattedDate);
      }

      if (activeDateField === "end") {
        setDraftEndDate(formattedDate);
      }
    }

    setActiveDateField(null);
  };

  return (
    <Screen padded={false}>
      <ScrollView
        className="flex-1 bg-sand-100"
        contentContainerClassName="gap-6 px-4 py-4"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchFilteredTransactions}
            tintColor="#1f6f5f"
          />
        }
      >
        <View className="-mx-4 rounded-b-[28px] bg-forest-500 px-4 pb-6 pt-2">
          <View className="flex-row items-center justify-between gap-3">
            <View className="gap-2">
              <Text className="text-3xl font-semibold text-white">
                {t("transactions.title")}
              </Text>
            </View>

            <Pressable
              onPress={() => setIsFilterOpen((current) => !current)}
              className="h-11 w-11 items-center justify-center rounded-full bg-white/20"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name={isFilterOpen ? "close" : "tune-variant"}
                size={22}
                color="#ffffff"
              />
            </Pressable>
          </View>
        </View>

        {isFilterOpen ? (
          <Panel>
            <View className="gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-medium text-ink-900">Filters</Text>
                <Pressable onPress={clearFilters}>
                  <Text className="text-sm font-medium text-ink-700">
                    {t("transactions.clear")}
                  </Text>
                </Pressable>
              </View>

              <FormInput
                label={t("transactions.category")}
                placeholder={t("transactions.categoryPlaceholder")}
                value={draftCategory}
                onChangeText={setDraftCategory}
              />

              <View className="gap-2">
                <Text className="text-sm font-semibold text-ink-900">
                  {t("transactions.type")}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {(["income", "expense", "transfer"] as const).map((value) => (
                    <FilterChip
                      key={value}
                      tone={
                        value === "income"
                          ? "green"
                          : value === "expense"
                            ? "orange"
                            : "neutral"
                      }
                      label={
                        value === "income"
                          ? t("transactionType.income")
                          : value === "expense"
                            ? t("transactionType.expense")
                            : t("transactionType.transfer")
                      }
                      selected={draftType === value}
                      onPress={() => setDraftType(draftType === value ? "" : value)}
                    />
                  ))}
                </View>
              </View>

              <View className="gap-2">
                <Text className="text-sm font-semibold text-ink-900">
                  {t("transactions.paymentMethod")}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {(["cash", "online"] as const).map((value) => (
                    <FilterChip
                      key={value}
                      tone="blue"
                      label={
                        value === "cash"
                          ? t("paymentMethod.cash")
                          : t("paymentMethod.online")
                      }
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
                  <View className="gap-2">
                    <Text className="text-sm font-semibold text-ink-900">
                      {t("transactions.startDate")}
                    </Text>
                    <Pressable
                      onPress={() => setActiveDateField("start")}
                      className="min-h-[52px] justify-center rounded-xl border border-sand-300 bg-sand-200 px-4 py-3"
                    >
                      <Text
                        className={
                          draftStartDate
                            ? "text-base text-ink-900"
                            : "text-base text-[#8d877e]"
                        }
                      >
                        {draftStartDate
                          ? parseDateInputValue(draftStartDate).toLocaleDateString(
                              language === "hi" ? "hi-IN" : "en-IN",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )
                          : t("transactions.datePlaceholder")}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View className="flex-1">
                  <View className="gap-2">
                    <Text className="text-sm font-semibold text-ink-900">
                      {t("transactions.endDate")}
                    </Text>
                    <Pressable
                      onPress={() => setActiveDateField("end")}
                      className="min-h-[52px] justify-center rounded-xl border border-sand-300 bg-sand-200 px-4 py-3"
                    >
                      <Text
                        className={
                          draftEndDate
                            ? "text-base text-ink-900"
                            : "text-base text-[#8d877e]"
                        }
                      >
                        {draftEndDate
                          ? parseDateInputValue(draftEndDate).toLocaleDateString(
                              language === "hi" ? "hi-IN" : "en-IN",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )
                          : t("transactions.datePlaceholder")}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {activeDateField ? (
                <DateTimePicker
                  value={
                    activeDateField === "start"
                      ? parseDateInputValue(draftStartDate)
                      : parseDateInputValue(draftEndDate)
                  }
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date(2100, 11, 31)}
                />
              ) : null}

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <PrimaryButton
                    label={t("transactions.applyFilters")}
                    tone="green"
                    onPress={applyFilters}
                  />
                </View>
                <View className="flex-1">
                  <PrimaryButton
                    label={t("transactions.clear")}
                    variant="ghost"
                    tone="dark"
                    onPress={clearFilters}
                  />
                </View>
              </View>
            </View>
          </Panel>
        ) : null}

        <View className="gap-3">
          <Text className="text-lg font-medium text-ink-900">
            {t("transactions.count", {
              count: transactions.length,
              s: transactions.length === 1 ? "" : "s",
            })}
          </Text>

          {isLoading ? (
            <LoadingCard label={t("transactions.loading")} />
          ) : error ? (
            <FeedbackCard
              title={t("transactions.loadError")}
              message={error}
              tone="error"
              actionLabel={t("dashboard.tryAgain")}
              onAction={fetchFilteredTransactions}
            />
          ) : transactions.length === 0 ? (
            <FeedbackCard
              title={t("transactions.noResultsTitle")}
              message={t("transactions.noResultsMessage")}
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
