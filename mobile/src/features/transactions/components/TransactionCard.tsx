import { memo } from "react";
import { Pressable, Text, View } from "react-native";

import { useI18n } from "@/hooks/use-i18n";
import type { Transaction } from "@/types/transaction";

const typeTone = {
  income: "text-forest-700 bg-forest-500/10",
  expense: "text-coral-500 bg-coral-500/10",
  transfer: "text-ink-900 bg-sand-200",
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

  return (
    <View className="rounded-[24px] border border-sand-200 bg-white px-4 py-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg font-semibold text-ink-900">
              {transaction.category}
            </Text>
            <View className={`rounded-full px-3 py-1 ${typeTone[transaction.type]}`}>
              <Text className="text-xs font-semibold">{typeLabel}</Text>
            </View>
          </View>

          <Text className="text-sm text-ink-700">
            {paymentMethodLabel} | {dateLabel}
          </Text>

          {transaction.description ? (
            <Text className="text-sm leading-6 text-ink-700">
              {transaction.description}
            </Text>
          ) : null}

          {transaction.person ? (
            <Text className="text-sm font-medium text-forest-700">
              {t("transactionCard.person")}: {transaction.person}
            </Text>
          ) : null}

          {onDelete ? (
            <Pressable
              onPress={() => onDelete(transaction._id)}
              disabled={isDeleting}
              className="mt-2 self-start rounded-full border border-coral-500/20 bg-coral-500/10 px-3 py-1"
            >
              <Text className="text-xs font-semibold text-coral-500">
                {isDeleting ? t("transactionCard.deleting") : t("transactionCard.delete")}
              </Text>
            </Pressable>
          ) : null}
        </View>

        <Text className="text-lg font-bold text-ink-900">
          {amountPrefix}
          {formatCurrency(transaction.amount)}
        </Text>
      </View>
    </View>
  );
}

export default memo(TransactionCard);
