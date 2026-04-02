import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

import FeedbackCard from "@/components/ui/FeedbackCard";
import LoadingCard from "@/components/ui/LoadingCard";
import Panel from "@/components/ui/Panel";
import SummaryCard from "@/features/dashboard/components/SummaryCard";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Screen from "@/components/ui/Screen";
import TransactionCard from "@/features/transactions/components/TransactionCard";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { aiService } from "@/services/ai/ai.service";
import {
  getCachedMonthlyInsight,
  setCachedMonthlyInsight,
} from "@/services/ai/insights-cache";
import { ApiError } from "@/services/api/http";
import { useTransactionStore } from "@/store/transaction-store";
import type { MonthlyInsightsResponse } from "@/types/transaction";

const getFriendlyInsightsErrorMessage = (message: string, busyMessage: string) => {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("quota exceeded") ||
    normalizedMessage.includes("rate limit")
  ) {
    return busyMessage;
  }

  return message;
};

export default function DashboardScreen() {
  const { formatCurrency, t } = useI18n();
  const router = useRouter();
  const { user, logout, token } = useAuth();
  const transactions = useTransactionStore((state) => state.overviewTransactions);
  const isLoading = useTransactionStore((state) => state.isOverviewLoading);
  const error = useTransactionStore((state) => state.overviewError);
  const fetchOverviewTransactions = useTransactionStore(
    (state) => state.fetchOverviewTransactions
  );
  const [insights, setInsights] =
    useState<MonthlyInsightsResponse["data"] | null>(null);
  const [insightsError, setInsightsError] = useState("");
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);
  const getCurrentInsightCacheKey = useCallback(() => {
    const now = new Date();
    return `${user?.id || "guest"}-${now.getFullYear()}-${now.getMonth() + 1}`;
  }, [user?.id]);

  const loadMonthlyInsights = useCallback(async (forceRefresh = false) => {
    if (!token) {
      setInsights(null);
      setInsightsError("");
      setIsInsightsLoading(false);
      return;
    }

    const now = new Date();
    const cacheKey = getCurrentInsightCacheKey();

    if (!forceRefresh) {
      const cachedInsights = getCachedMonthlyInsight(cacheKey);

      if (cachedInsights) {
        setInsights(cachedInsights);
        setInsightsError("");
        setIsInsightsLoading(false);
        return;
      }
    }

    try {
      setIsInsightsLoading(true);
      setInsightsError("");

      const response = await aiService.getMonthlyInsights(token, {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        timezone: "Asia/Calcutta",
      });

      setInsights(response.data);
      setCachedMonthlyInsight(cacheKey, response.data);
    } catch (loadError) {
      setInsights(null);
      setInsightsError(
        loadError instanceof ApiError
          ? getFriendlyInsightsErrorMessage(loadError.message, t("dashboard.aiBusy"))
          : t("dashboard.aiInsightFallback")
      );
    } finally {
      setIsInsightsLoading(false);
    }
  }, [getCurrentInsightCacheKey, t, token]);

  const hydrateMonthlyInsightsFromCache = useCallback(() => {
    const cachedInsights = getCachedMonthlyInsight(getCurrentInsightCacheKey());

    if (cachedInsights) {
      setInsights(cachedInsights);
      setInsightsError("");
      return;
    }

    setInsights(null);
  }, [getCurrentInsightCacheKey]);

  useFocusEffect(
    useCallback(() => {
      fetchOverviewTransactions();
      hydrateMonthlyInsightsFromCache();
    }, [fetchOverviewTransactions, hydrateMonthlyInsightsFromCache])
  );

  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const expense = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);
  const balance = income - expense;
  const cashTotal = transactions
    .filter((item) => item.paymentMethod === "cash")
    .reduce((sum, item) => sum + item.amount, 0);
  const onlineTotal = transactions
    .filter((item) => item.paymentMethod === "online")
    .reduce((sum, item) => sum + item.amount, 0);
  const recentTransactions = transactions.slice(0, 3);

  return (
    <Screen padded={false}>
      <ScrollView
        className="flex-1 bg-sand-100"
        contentContainerClassName="gap-6 px-5 py-4"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchOverviewTransactions}
            tintColor="#1f6f5f"
          />
        }
      >
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1 gap-2">
            <Text className="text-sm font-semibold uppercase tracking-[2px] text-forest-700">
              {t("dashboard.welcome")}
            </Text>
            <Text className="text-3xl font-bold text-ink-900">
              {user?.name || t("dashboard.defaultTitle")}

            </Text>
          </View>

          <View className="items-end gap-2">
            <LanguageToggle />
            <View className="w-auto">
              <PrimaryButton
                label={t("dashboard.logout")}
                variant="ghost"
                onPress={async () => {
                  useTransactionStore.getState().reset();
                  await logout();
                }}
              />
            </View>
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-base leading-7 text-ink-700">
            {t("dashboard.summary")}
          </Text>
        </View>

        <View className="flex-row gap-3">
          <SummaryCard
            label={t("dashboard.income")}
            value={formatCurrency(income)}
            accent="green"
          />
          <SummaryCard
            label={t("dashboard.expense")}
            value={formatCurrency(expense)}
            accent="orange"
          />
        </View>

        <SummaryCard
          label={t("dashboard.balance")}
          value={formatCurrency(balance)}
          accent="neutral"
        />

        <Panel>
          <Text className="text-lg font-semibold text-ink-900">
            {t("dashboard.paymentMethodSplit")}
          </Text>
          <View className="mt-4 flex-row gap-3">
            <View className="flex-1 rounded-[24px] bg-sand-50 px-4 py-4">
              <Text className="text-sm font-medium text-ink-700">{t("dashboard.cash")}</Text>
              <Text className="mt-2 text-2xl font-bold text-ink-900">
                {formatCurrency(cashTotal)}
              </Text>
            </View>
            <View className="flex-1 rounded-[24px] bg-sand-50 px-4 py-4">
              <Text className="text-sm font-medium text-ink-700">{t("dashboard.online")}</Text>
              <Text className="mt-2 text-2xl font-bold text-ink-900">
                {formatCurrency(onlineTotal)}
              </Text>
            </View>



          </View>

        </Panel>

        <Panel>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <PrimaryButton
                label={t("dashboard.aiQuickAdd")}
                variant="ghost"
                onPress={() => router.push("/(app)/ai-add-transaction")}
              />
            </View>
            <View className="flex-1">
              <PrimaryButton
                label={t("dashboard.addTransaction")}
                onPress={() => router.push("/(app)/add-transaction")}
              />
            </View>
          </View>
        </Panel>

        <Panel>
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-ink-900">
              {t("dashboard.aiInsight")}
            </Text>
            {insights ? (
              <Text
                className="text-sm font-semibold text-forest-700"
                onPress={() => loadMonthlyInsights(true)}
              >
                {t("dashboard.refresh")}
              </Text>
            ) : null}
          </View>

          {isInsightsLoading ? (
            <LoadingCard label={t("dashboard.generatingInsight")} />
          ) : insightsError ? (
            <FeedbackCard
              title={t("dashboard.aiInsightError")}
              message={insightsError}
              tone="error"
              actionLabel={t("dashboard.tryAgain")}
              onAction={() => loadMonthlyInsights(true)}
            />
          ) : insights ? (
            <View className="gap-4">
              <View className="gap-2">
                <Text className="text-xl font-semibold text-ink-900">
                  {insights.insight.headline}
                </Text>
                <Text className="text-base leading-7 text-ink-700">
                  {insights.insight.summary}
                </Text>
              </View>

              <View className="rounded-[24px] bg-sand-50 px-4 py-4">
                <Text className="text-sm font-semibold text-ink-900">
                  {t("dashboard.suggestedAction")}
                </Text>
                <Text className="mt-2 text-base leading-7 text-ink-700">
                  {insights.insight.suggestion}
                </Text>
              </View>

              <View className="gap-2">
                <Text className="text-sm font-semibold text-ink-900">
                  {t("dashboard.topCategories")}
                </Text>
                {insights.topCategories.length === 0 ? (
                  <Text className="text-base text-ink-700">
                    {t("dashboard.noExpenseCategories")}
                  </Text>
                ) : (
                  insights.topCategories.map((category) => (
                    <View
                      key={category.category}
                      className="flex-row items-center justify-between rounded-2xl bg-sand-50 px-4 py-3"
                    >
                      <Text className="text-base font-medium text-ink-900">
                        {category.category}
                      </Text>
                      <Text className="text-base font-semibold text-forest-700">
                        {formatCurrency(category.total)}
                      </Text>
                    </View>
                  ))
                )}
              </View>

              <Text className="text-sm font-medium text-forest-700">
                {t("dashboard.transactionsAnalyzed", {
                  count: insights.transactionsAnalyzed,
                  s: insights.transactionsAnalyzed === 1 ? "" : "s",
                  month: insights.month,
                  year: insights.year,
                })}
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              <FeedbackCard
                title={t("dashboard.noInsightsTitle")}
                message={t("dashboard.noInsightsMessage")}
              />
              <PrimaryButton
                label={t("dashboard.generateInsight")}
                onPress={() => loadMonthlyInsights(true)}
              />
            </View>
          )}
        </Panel>



        <Panel>
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-ink-900">
              {t("dashboard.recentTransactions")}
            </Text>
            <Text
              className="text-sm font-semibold text-forest-700"
              onPress={() => router.push("/(app)/(tabs)/transactions")}
            >
              {t("dashboard.viewAll")}
            </Text>
          </View>

          {isLoading ? (
            <LoadingCard label={t("dashboard.refreshingTransactions")} />
          ) : error ? (
            <FeedbackCard
              title={t("dashboard.overviewError")}
              message={error}
              tone="error"
              actionLabel={t("dashboard.tryAgain")}
              onAction={fetchOverviewTransactions}
            />
          ) : recentTransactions.length === 0 ? (
            <FeedbackCard
              title={t("dashboard.noTransactionsTitle")}
              message={t("dashboard.noTransactionsMessage")}
            />
          ) : (
            <View className="gap-3">
              {recentTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction._id}
                  transaction={transaction}
                />
              ))}
            </View>
          )}
        </Panel>
      </ScrollView>
    </Screen>
  );
}
