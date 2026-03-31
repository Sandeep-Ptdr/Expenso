import { memo } from "react";
import { Text, View } from "react-native";

import type { Transaction } from "@/types/transaction";

const typeTone = {
  income: "text-forest-700 bg-forest-500/10",
  expense: "text-coral-500 bg-coral-500/10",
  transfer: "text-ink-900 bg-sand-200",
};

function TransactionCard({
  transaction,
}: {
  transaction: Transaction;
}) {
  const amountPrefix = transaction.type === "expense" ? "-" : "+";
  const dateLabel = new Date(transaction.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <View className="rounded-[24px] border border-sand-200 bg-white px-4 py-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg font-semibold text-ink-900">
              {transaction.category}
            </Text>
            <View className={`rounded-full px-3 py-1 ${typeTone[transaction.type]}`}>
              <Text className="text-xs font-semibold capitalize">
                {transaction.type}
              </Text>
            </View>
          </View>

          <Text className="text-sm text-ink-700">
            {transaction.paymentMethod.toUpperCase()} | {dateLabel}
          </Text>

          {transaction.description ? (
            <Text className="text-sm leading-6 text-ink-700">
              {transaction.description}
            </Text>
          ) : null}

          {transaction.person ? (
            <Text className="text-sm font-medium text-forest-700">
              Person: {transaction.person}
            </Text>
          ) : null}
        </View>

        <Text className="text-lg font-bold text-ink-900">
          {amountPrefix}Rs. {transaction.amount.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

export default memo(TransactionCard);
