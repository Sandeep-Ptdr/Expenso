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
import { useAuth } from "@/hooks/use-auth";
import { aiService } from "@/services/ai/ai.service";
import { ApiError } from "@/services/api/http";
import { useTransactionStore } from "@/store/transaction-store";
import type { MonthlyInsightsResponse } from "@/types/transaction";

export default function DashboardScreen() {
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
  const [isInsightsLoading, setIsInsightsLoading] = useState(true);

  const loadMonthlyInsights = useCallback(async () => {
    if (!token) {
      setInsights(null);
      setInsightsError("");
      setIsInsightsLoading(false);
      return;
    }

    try {
      setIsInsightsLoading(true);
      setInsightsError("");

      const now = new Date();
      const response = await aiService.getMonthlyInsights(token, {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        timezone: "Asia/Calcutta",
      });

      setInsights(response.data);
    } catch (loadError) {
      setInsights(null);
      setInsightsError(
        loadError instanceof ApiError
          ? loadError.message
          : "Unable to load AI insights right now."
      );
    } finally {
      setIsInsightsLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchOverviewTransactions();
      loadMonthlyInsights();
    }, [fetchOverviewTransactions, loadMonthlyInsights])
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
              Welcome back
            </Text>
            <Text className="text-3xl font-bold text-ink-900">
              {user?.name || "Dashboard"}
            </Text>
          </View>

          <View className="w-28">
            <PrimaryButton
              label="Logout"
              variant="ghost"
              onPress={async () => {
                useTransactionStore.getState().reset();
                await logout();
              }}
            />
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-base leading-7 text-ink-700">
            Track income, expenses, and transfers with a quick summary of where your
            money stands today.
          </Text>
        </View>

        <View className="flex-row gap-3">
          <SummaryCard
            label="Income"
            value={`Rs. ${income.toFixed(2)}`}
            accent="green"
          />
          <SummaryCard
            label="Expense"
            value={`Rs. ${expense.toFixed(2)}`}
            accent="orange"
          />
        </View>

        <SummaryCard
          label="Balance"
          value={`Rs. ${balance.toFixed(2)}`}
          accent="neutral"
        />

        <Panel>
          <Text className="text-lg font-semibold text-ink-900">
            Payment Method Split
          </Text>
          <View className="mt-4 flex-row gap-3">
            <View className="flex-1 rounded-[24px] bg-sand-50 px-4 py-4">
              <Text className="text-sm font-medium text-ink-700">Cash</Text>
              <Text className="mt-2 text-2xl font-bold text-ink-900">
                Rs. {cashTotal.toFixed(2)}
              </Text>
            </View>
            <View className="flex-1 rounded-[24px] bg-sand-50 px-4 py-4">
              <Text className="text-sm font-medium text-ink-700">Online</Text>
              <Text className="mt-2 text-2xl font-bold text-ink-900">
                Rs. {onlineTotal.toFixed(2)}
              </Text>
            </View>
          </View>
        </Panel>

        <Panel>
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-ink-900">
              AI Monthly Insight
            </Text>
            <Text
              className="text-sm font-semibold text-forest-700"
              onPress={loadMonthlyInsights}
            >
              Refresh
            </Text>
          </View>

          {isInsightsLoading ? (
            <LoadingCard label="Generating your monthly AI insight..." />
          ) : insightsError ? (
            <FeedbackCard
              title="Unable to load AI insight"
              message={insightsError}
              tone="error"
              actionLabel="Try Again"
              onAction={loadMonthlyInsights}
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
                  Suggested action
                </Text>
                <Text className="mt-2 text-base leading-7 text-ink-700">
                  {insights.insight.suggestion}
                </Text>
              </View>

              <View className="gap-2">
                <Text className="text-sm font-semibold text-ink-900">
                  Top expense categories this month
                </Text>
                {insights.topCategories.length === 0 ? (
                  <Text className="text-base text-ink-700">
                    No expense categories yet for this month.
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
                        Rs. {category.total.toFixed(2)}
                      </Text>
                    </View>
                  ))
                )}
              </View>

              <Text className="text-sm font-medium text-forest-700">
                Based on {insights.transactionsAnalyzed} transaction
                {insights.transactionsAnalyzed === 1 ? "" : "s"} from{" "}
                {insights.month}/{insights.year}.
              </Text>
            </View>
          ) : (
            <FeedbackCard
              title="No insights available"
              message="Add a few transactions this month to unlock AI-generated summaries and spending suggestions."
            />
          )}
        </Panel>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <PrimaryButton
              label="AI quick add"
              variant="ghost"
              onPress={() => router.push("/(app)/ai-add-transaction")}
            />
          </View>
          <View className="flex-1">
            <PrimaryButton
              label="Add transaction"
              onPress={() => router.push("/(app)/add-transaction")}
            />
          </View>
        </View>

        <Panel>
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-ink-900">
              Recent Transactions
            </Text>
            <Text
              className="text-sm font-semibold text-forest-700"
              onPress={() => router.push("/(app)/(tabs)/transactions")}
            >
              View all
            </Text>
          </View>

          {isLoading ? (
            <LoadingCard label="Refreshing your latest transactions..." />
          ) : error ? (
            <FeedbackCard
              title="Unable to load overview"
              message={error}
              tone="error"
              actionLabel="Try Again"
              onAction={fetchOverviewTransactions}
            />
          ) : recentTransactions.length === 0 ? (
            <FeedbackCard
              title="No transactions yet"
              message="Add your first income or expense to start seeing trends and balances."
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
