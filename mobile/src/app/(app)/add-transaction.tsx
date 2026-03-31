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
import { useAuth } from "@/hooks/use-auth";
import { aiService } from "@/services/ai/ai.service";
import { ApiError } from "@/services/api/http";
import { useTransactionStore } from "@/store/transaction-store";
import type { PaymentMethod, TransactionType } from "@/types/transaction";
import {
  transactionSchema,
  type TransactionFormValues,
} from "@/validations/transaction";

const aiExamples = [
  "Paid 300 cash for lunch today",
  "Received 25000 salary online today",
  "Sent 1500 online to Rahul for rent",
];

export default function AddTransactionScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const createTransaction = useTransactionStore((state) => state.createTransaction);
  const isSubmitting = useTransactionStore((state) => state.isCreating);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiError, setAiError] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [aiMissingFields, setAiMissingFields] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
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

  const handleParseTransactionText = async () => {
    if (!token) {
      setAiError("Your session has expired. Please sign in again.");
      return;
    }

    if (!aiPrompt.trim()) {
      setAiError("Enter a sentence like 'Paid 300 cash for lunch today'.");
      return;
    }

    try {
      setIsParsing(true);
      setAiError("");
      setAiSummary("");
      setAiConfidence(null);
      setAiMissingFields([]);

      const response = await aiService.parseTransactionText(token, {
        text: aiPrompt.trim(),
        timezone: "Asia/Calcutta",
      });

      const parsed = response.data.parsedTransaction;

      if (parsed.type) {
        setValue("type", parsed.type, { shouldValidate: true });
      }

      if (parsed.amount !== null) {
        setValue("amount", String(parsed.amount), { shouldValidate: true });
      }

      if (parsed.category) {
        setValue("category", parsed.category, { shouldValidate: true });
      }

      if (parsed.paymentMethod) {
        setValue("paymentMethod", parsed.paymentMethod, { shouldValidate: true });
      }

      if (parsed.description) {
        setValue("description", parsed.description, { shouldValidate: true });
      }

      if (parsed.date) {
        setValue("date", parsed.date, { shouldValidate: true });
      }

      setValue("person", parsed.person || "", { shouldValidate: true });
      setAiConfidence(parsed.confidence);
      setAiMissingFields(parsed.missingFields);

      setAiSummary(
        parsed.missingFields.length > 0
          ? `AI filled most fields. Please review: ${parsed.missingFields.join(", ")}`
          : "AI filled the form. Please review and save."
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setAiError(error.message);
      } else {
        setAiError("Unable to parse that transaction right now.");
      }
    } finally {
      setIsParsing(false);
    }
  };

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
              <Text className="text-lg font-semibold text-ink-900">
                AI Transaction Parser
              </Text>
              <Text className="text-base leading-7 text-ink-700">
                Type something like `Paid 300 cash for lunch today` and let AI fill
                the form for you.
              </Text>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-ink-900">
                Quick examples
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {aiExamples.map((example) => (
                  <FilterChip
                    key={example}
                    label={example}
                    onPress={() => {
                      setAiPrompt(example);
                      setAiError("");
                    }}
                  />
                ))}
              </View>
            </View>

            <FormInput
              label="Describe the transaction"
              value={aiPrompt}
              onChangeText={setAiPrompt}
              placeholder="Paid 300 cash for lunch today"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {aiError ? (
              <FeedbackCard
                title="AI parsing failed"
                message={aiError}
                tone="error"
              />
            ) : null}

            {aiConfidence !== null ? (
              <View className="rounded-2xl border border-sand-200 bg-sand-50 px-4 py-3">
                <Text className="text-sm font-semibold text-ink-900">
                  AI confidence
                </Text>
                <Text className="mt-1 text-base text-ink-700">
                  {Math.round(aiConfidence * 100)}% confident in the parsed result.
                </Text>
              </View>
            ) : null}

            {aiMissingFields.length > 0 ? (
              <View className="rounded-2xl border border-sand-200 bg-sand-50 px-4 py-3">
                <Text className="text-sm font-semibold text-ink-900">
                  Still needs your review
                </Text>
                <Text className="mt-1 text-base text-ink-700">
                  {aiMissingFields.join(", ")}
                </Text>
              </View>
            ) : null}

            {aiSummary ? (
              <FeedbackCard
                title="AI parsing complete"
                message={aiSummary}
              />
            ) : null}

            <View className="flex-row gap-3">
              <View className="flex-1">
                <PrimaryButton
                  label={isParsing ? "Parsing..." : "Fill With AI"}
                  onPress={handleParseTransactionText}
                  disabled={isParsing}
                />
              </View>
              <View className="flex-1">
                <PrimaryButton
                  label="Clear"
                  variant="ghost"
                  onPress={() => {
                    setAiPrompt("");
                    setAiError("");
                    setAiSummary("");
                    setAiConfidence(null);
                    setAiMissingFields([]);
                  }}
                  disabled={isParsing}
                />
              </View>
            </View>
          </View>
        </Panel>

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
