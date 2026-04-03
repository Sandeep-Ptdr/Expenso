import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import FeedbackCard from "@/components/ui/FeedbackCard";
import LanguageToggle from "@/components/ui/LanguageToggle";
import LoadingCard from "@/components/ui/LoadingCard";
import Panel from "@/components/ui/Panel";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Screen from "@/components/ui/Screen";
import SummaryCard from "@/features/dashboard/components/SummaryCard";
import TransactionCard from "@/features/transactions/components/TransactionCard";
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

type DashboardActionButtonProps = {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  tone: "green" | "accent";
};

function DashboardActionButton({
  label,
  icon,
  onPress,
  tone,
}: DashboardActionButtonProps) {
  const isGreen = tone === "green";
  const content = (
    <View className="min-h-[70px] flex-row items-center justify-center gap-2 rounded-[18px] px-4">
      <MaterialCommunityIcons name={icon} size={22} color="#ffffff" />
      <Text className="text-[15px] font-semibold text-white">{label}</Text>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-1"
      style={({ pressed }) => ({
        opacity: pressed ? 0.94 : 1,
        transform: [{ scale: pressed ? 0.985 : 1 }],
        shadowColor: isGreen ? "#10b981" : "#d946ef",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 18,
        elevation: 8,
      })}
    >
      {isGreen ? (
        <View className="rounded-[18px] bg-forest-500">{content}</View>
      ) : (
        <LinearGradient
          colors={["#A855F7", "#EC4899"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          className="rounded-[18px]"
          style={{ overflow: "hidden" }}
        >
          {content}
        </LinearGradient>
      )}
    </Pressable>
  );
}

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
  const outgoing = transactions
    .filter((item) => item.type === "expense" || item.type === "transfer")
    .reduce((sum, item) => sum + item.amount, 0);
  const balance = income - outgoing;
  const cashTotal = transactions.reduce((sum, item) => {
    if (item.paymentMethod !== "cash") {
      return sum;
    }

    return item.type === "income" ? sum + item.amount : sum - item.amount;
  }, 0);
  const onlineTotal = transactions.reduce((sum, item) => {
    if (item.paymentMethod !== "online") {
      return sum;
    }

    return item.type === "income" ? sum + item.amount : sum - item.amount;
  }, 0);
  const recentTransactions = transactions.slice(0, 3);

  return (
    <Screen padded={false}>
      <ScrollView
        className="flex-1 bg-sand-100"
        contentContainerClassName="gap-6 px-4 py-4"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchOverviewTransactions}
            tintColor="#1f6f5f"
          />
        }
      >
        <View className="-mx-4 rounded-b-[28px] bg-[#10B981] px-4 pb-6 pt-2">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1 gap-2">
              <Text className="text-base font-medium text-white/90">
                {t("dashboard.welcome")}
              </Text>
              <Text className="text-3xl font-semibold text-white">
                {user?.name || t("dashboard.defaultTitle")}
              </Text>
            </View>

            <View className="items-end gap-3">
              <LanguageToggle />
              <PrimaryButton
                label={t("dashboard.logout")}
                variant="solid"
                tone="dark"
                onPress={async () => {
                  useTransactionStore.getState().reset();
                  await logout();
                }}
              />
            </View>
          </View>
        </View>

        <View className="gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <SummaryCard
                label={t("dashboard.income")}
                value={formatCurrency(income)}
                accent="green"
              />
            </View>
            <View className="flex-1">
              <SummaryCard
                label={t("dashboard.expense")}
                value={formatCurrency(outgoing)}
                accent="orange"
              />
            </View>
          </View>
          <SummaryCard
            label={t("dashboard.balance")}
            value={formatCurrency(balance)}
            accent="neutral"
          />
        </View>

        <Panel>
          <Text className="text-lg font-medium text-ink-900">
            {t("dashboard.paymentMethodSplit")}
          </Text>
          <View className="mt-4 flex-row gap-3">
            <View className="flex-1 rounded-[24px] border border-sand-300 bg-white px-4 py-4 shadow-card">
              <View className="flex-row items-center gap-1 ">
                <View className=" items-center justify-center rounded-full ">
                  <MaterialCommunityIcons
                    name="cash-multiple"
                    size={18}
                    color="#6b6b6b"
                  />
                </View>
                <Text className="text-[15px] font-medium text-ink-700">
                  {t("dashboard.cash")}
                </Text>
              </View>
              <Text className="mt-4 text-[20px] font-semibold text-ink-900">
                {formatCurrency(cashTotal)}
              </Text>
            </View>

            <View className="flex-1 rounded-[24px] border border-sand-300 bg-white px-4 py-4 shadow-card">
              <View className="flex-row items-center gap-1">
                <View className=" items-center justify-center rounded-full">
                  <MaterialCommunityIcons
                    name="credit-card-outline"
                    size={18}
                    color="#6b6b6b"
                  />
                </View>
                <Text className="text-[15px] font-medium text-ink-700">
                  {t("dashboard.online")}
                </Text>
              </View>
              <Text className="mt-4 text-[20px] font-semibold text-ink-900">
                {formatCurrency(onlineTotal)}
              </Text>
            </View>
          </View>
        </Panel>

        <View className="flex-row gap-3">
          <DashboardActionButton
            label={t("dashboard.addTransaction")}
            icon="plus"
            tone="green"
            onPress={() => router.push("/(app)/add-transaction")}
          />
          <DashboardActionButton
            label={t("dashboard.aiQuickAdd")}
            icon="auto-fix"
            tone="accent"
            onPress={() => router.push("/(app)/ai-add-transaction")}
          />
        </View>

        <Panel>
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-medium text-accent-500">
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
                <Text className="text-xl font-medium text-ink-900">
                  {insights.insight.headline}
                </Text>
                <Text className="text-base leading-7 text-ink-700">
                  {insights.insight.summary}
                </Text>
              </View>

              <View className="rounded-2xl border border-accent-500/15 bg-accent-100 px-4 py-4">
                <Text className="text-sm font-medium text-accent-500">
                  {t("dashboard.suggestedAction")}
                </Text>
                <Text className="mt-2 text-base leading-7 text-ink-900">
                  {insights.insight.suggestion}
                </Text>
              </View>

              <View className="gap-2">
                <Text className="text-sm font-medium text-ink-900">
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
                      className="flex-row items-center justify-between rounded-2xl border border-sand-300 bg-sand-100 px-4 py-3"
                    >
                      <Text className="text-base font-medium text-ink-900">
                        {category.category}
                      </Text>
                      <Text className="text-base font-medium text-forest-700">
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
                tone="accent"
                onPress={() => loadMonthlyInsights(true)}
              />
            </View>
          )}
        </Panel>

        <Panel>
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-medium text-ink-900">
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
