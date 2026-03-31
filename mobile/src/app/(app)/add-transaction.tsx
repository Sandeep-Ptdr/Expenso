import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import FilterChip from "@/components/ui/FilterChip";
import FormInput from "@/components/ui/FormInput";
import FeedbackCard from "@/components/ui/FeedbackCard";
import Panel from "@/components/ui/Panel";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Screen from "@/components/ui/Screen";
import { ApiError } from "@/services/api/http";
import { useTransactionStore } from "@/store/transaction-store";
import type { PaymentMethod, TransactionType } from "@/types/transaction";
import {
  transactionSchema,
  type TransactionFormValues,
} from "@/validations/transaction";

export default function AddTransactionScreen() {
  const router = useRouter();
  const createTransaction = useTransactionStore((state) => state.createTransaction);
  const isSubmitting = useTransactionStore((state) => state.isCreating);
  const [serverError, setServerError] = useState("");
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: "",
      category: "",
      paymentMethod: "cash",
      description: "",
      date: new Date().toISOString().slice(0, 10),
      person: "",
    },
  });

  const selectedType = watch("type");
  const selectedPaymentMethod = watch("paymentMethod");

  const onSubmit = handleSubmit(async (values) => {
    try {
      setServerError("");

      await createTransaction({
        type: values.type,
        amount: Number(values.amount),
        category: values.category.trim(),
        paymentMethod: values.paymentMethod,
        description: values.description?.trim() || "",
        date: new Date(values.date).toISOString(),
        person: values.person?.trim() || "",
      });

      router.back();
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
      } else {
        setServerError("Unable to save this transaction right now.");
      }
    }
  });

  return (
    <Screen padded={false}>
      <ScrollView
        className="flex-1 bg-sand-100"
        contentContainerClassName="gap-6 px-5 py-4"
      >
        <View className="gap-2">
          <Text className="text-3xl font-bold text-ink-900">Add Transaction</Text>
          <Text className="text-base leading-7 text-ink-700">
            Add income, expense, or transfer entries with the exact details you want
            to track.
          </Text>
        </View>

        <Panel>
          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-semibold text-ink-900">Type</Text>
              <View className="flex-row flex-wrap gap-2">
                {(["income", "expense", "transfer"] as const).map((value) => (
                  <FilterChip
                    key={value}
                    label={value}
                    selected={selectedType === value}
                    onPress={() =>
                      setValue("type", value as TransactionType, {
                        shouldValidate: true,
                      })
                    }
                  />
                ))}
              </View>
            </View>

            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Amount"
                  keyboardType="decimal-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="0.00"
                  error={errors.amount?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Category"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Food, Salary, Rent..."
                  error={errors.category?.message}
                />
              )}
            />

            <View className="gap-2">
              <Text className="text-sm font-semibold text-ink-900">
                Payment Method
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {(["cash", "online"] as const).map((value) => (
                  <FilterChip
                    key={value}
                    label={value}
                    selected={selectedPaymentMethod === value}
                    onPress={() =>
                      setValue("paymentMethod", value as PaymentMethod, {
                        shouldValidate: true,
                      })
                    }
                  />
                ))}
              </View>
            </View>

            <Controller
              control={control}
              name="date"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Date"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="YYYY-MM-DD"
                  error={errors.date?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Description"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Optional note"
                  error={errors.description?.message}
                />
              )}
            />

            {selectedType === "transfer" ? (
              <Controller
                control={control}
                name="person"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    label="Person"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Who is involved in this transfer?"
                    error={errors.person?.message}
                  />
                )}
              />
            ) : null}

            {serverError ? (
              <FeedbackCard
                title="Could not save transaction"
                message={serverError}
                tone="error"
              />
            ) : null}

            <PrimaryButton
              label={isSubmitting ? "Saving..." : "Save Transaction"}
              onPress={onSubmit}
              disabled={isSubmitting}
            />
          </View>
        </Panel>
      </ScrollView>
    </Screen>
  );
}
