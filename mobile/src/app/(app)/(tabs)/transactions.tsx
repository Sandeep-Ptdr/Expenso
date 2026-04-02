import { useState } from "react";
import { Alert, Pressable } from "react-native";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

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
          <Text className="text-3xl font-bold text-ink-900">{t("transactions.title")}</Text>
          <Text className="text-base leading-7 text-ink-700">
            {t("transactions.subtitle")}
          </Text>
        </View>

        <Panel>
          <View className="gap-4">
            <FormInput
              label={t("transactions.category")}
              placeholder={t("transactions.categoryPlaceholder")}
              value={draftCategory}
              onChangeText={setDraftCategory}
            />

            <View className="gap-2">
              <Text className="text-sm font-semibold text-ink-900">{t("transactions.type")}</Text>
              <View className="flex-row flex-wrap gap-2">
                {(["income", "expense", "transfer"] as const).map((value) => (
                  <FilterChip
                    key={value}
                    label={
                      value === "income"
                        ? t("transactionType.income")
                        : value === "expense"
                          ? t("transactionType.expense")
                          : t("transactionType.transfer")
                    }
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
                {t("transactions.paymentMethod")}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {(["cash", "online"] as const).map((value) => (
                  <FilterChip
                    key={value}
                    label={value === "cash" ? t("paymentMethod.cash") : t("paymentMethod.online")}
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
                    className="rounded-2xl border border-sand-300 bg-white px-4 py-4"
                  >
                    <Text
                      className={
                        draftStartDate ? "text-base text-ink-900" : "text-base text-[#8d877e]"
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
                    className="rounded-2xl border border-sand-300 bg-white px-4 py-4"
                  >
                    <Text
                      className={
                        draftEndDate ? "text-base text-ink-900" : "text-base text-[#8d877e]"
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
                <PrimaryButton label={t("transactions.applyFilters")} onPress={applyFilters} />
              </View>
              <View className="flex-1">
                <PrimaryButton
                  label={t("transactions.clear")}
                  variant="ghost"
                  onPress={clearFilters}
                />
              </View>
            </View>
          </View>
        </Panel>

        <View className="gap-3">
          <Text className="text-lg font-semibold text-ink-900">
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
