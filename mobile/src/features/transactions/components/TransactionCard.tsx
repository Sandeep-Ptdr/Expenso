import { MaterialCommunityIcons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

import { useI18n } from "@/hooks/use-i18n";
import type { Transaction } from "@/types/transaction";

const typeTone = {
  income: {
    badge: "bg-[#d1fae5] text-forest-700",
    amount: "text-forest-700",
    iconWrap: "bg-[#d1fae5]",
    fallbackIcon: "cash-plus" as const,
  },
  expense: {
    badge: "bg-coral-100 text-coral-700",
    amount: "text-coral-700",
    iconWrap: "bg-[#ffedd5]",
    fallbackIcon: "shopping-outline" as const,
  },
  transfer: {
    badge: "bg-coral-100 text-coral-700",
    amount: "text-coral-700",
    iconWrap: "bg-[#ffedd5]",
    fallbackIcon: "swap-vertical" as const,
  },
};

const getCategoryIcon = (transaction: Transaction) => {
  const normalizedCategory = transaction.category.trim().toLowerCase();

  if (transaction.type === "transfer") {
    return "swap-vertical";
  }

  if (transaction.type === "income") {
    if (normalizedCategory.includes("salary")) {
      return "home-outline";
    }

    if (
      normalizedCategory.includes("freelance") ||
      normalizedCategory.includes("business")
    ) {
      return "briefcase-outline";
    }

    return typeTone.income.fallbackIcon;
  }

  if (
    normalizedCategory.includes("food") ||
    normalizedCategory.includes("grocer") ||
    normalizedCategory.includes("shopping")
  ) {
    return "shopping-outline";
  }

  if (
    normalizedCategory.includes("coffee") ||
    normalizedCategory.includes("tea") ||
    normalizedCategory.includes("drink")
  ) {
    return "coffee-outline";
  }

  if (
    normalizedCategory.includes("transport") ||
    normalizedCategory.includes("fuel") ||
    normalizedCategory.includes("travel")
  ) {
    return "car-outline";
  }

  if (
    normalizedCategory.includes("rent") ||
    normalizedCategory.includes("house")
  ) {
    return "home-outline";
  }

  return typeTone[transaction.type].fallbackIcon;
};

function TransactionCard({
  transaction,
  onDelete,
  isDeleting = false,
}: {
  transaction: Transaction;
  onDelete?: (transactionId: string) => void;
  isDeleting?: boolean;
}) {
  const { formatCurrency, formatDate, t } = useI18n();
  const amountPrefix = transaction.type === "income" ? "+" : "-";
  const dateLabel = formatDate(transaction.date);
  const typeLabel =
    transaction.type === "income"
      ? t("transactionType.income")
      : transaction.type === "expense"
        ? t("transactionType.expense")
        : t("transactionType.transfer");
  const paymentMethodLabel =
    transaction.paymentMethod === "cash"
      ? t("paymentMethod.cash")
      : t("paymentMethod.online");
  const iconName = getCategoryIcon(transaction);
  const iconColor = transaction.type === "income" ? "#10b981" : "#f97316";

  return (
    <View className="rounded-[22px] border border-sand-300 bg-white px-4 py-4 shadow-card">
      <View className="flex-row items-start gap-4">
        <View
          className={`mt-1 h-12 w-12 items-center justify-center rounded-full ${typeTone[transaction.type].iconWrap}`}
        >
          <MaterialCommunityIcons
            name={iconName}
            size={24}
            color={iconColor}
          />
        </View>

        <View className="flex-1 gap-2">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-1">
              <Text className="text-[16px] font-medium text-ink-900">
                {transaction.category}
              </Text>

              <View className="flex-row flex-wrap items-center gap-2">
                <View
                  className={`rounded-md px-2.5 py-1 ${typeTone[transaction.type].badge}`}
                >
                  <Text className="text-[10px] font-medium">{typeLabel}</Text>
                </View>
                

                <Text className="text-[15px] text-ink-700">•</Text>
                <Text className="text-[13px] text-ink-700">{paymentMethodLabel}</Text>
                
                {transaction.person ? (
                  <View className="flex-row gap-1">
                    <Text className="text-[15px] text-ink-700">•</Text>
                    <Text className="text-[13px] text-ink-700">{transaction.person}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <Text
              className={`text-[15px] font-medium ${typeTone[transaction.type].amount}`}
            >
              {amountPrefix}
              {formatCurrency(transaction.amount)}
            </Text>
          </View>

          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-[12px] text-ink-700">{dateLabel}</Text>

            {onDelete ? (
              <Pressable
                onPress={() => onDelete(transaction._id)}
                disabled={isDeleting}
                className="rounded-full p-1.5"
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={20}
                  color="#f43f5e"
                />
              </Pressable>
            ) : null}
          </View>

          {transaction.description ? (
            <Text className="text-sm leading-6 text-ink-700">
              {transaction.description}
            </Text>
          ) : null}

          {onDelete && isDeleting ? (
            <Text className="text-xs font-medium text-coral-500">
              {t("transactionCard.deleting")}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default memo(TransactionCard);
