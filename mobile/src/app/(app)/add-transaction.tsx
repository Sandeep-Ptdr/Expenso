import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import FilterChip from "@/components/ui/FilterChip";
import FormInput from "@/components/ui/FormInput";
import FeedbackCard from "@/components/ui/FeedbackCard";
import Panel from "@/components/ui/Panel";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Screen from "@/components/ui/Screen";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
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

export default function AddTransactionScreen() {
  const { language, t } = useI18n();
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
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
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

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedValue?: Date
  ) => {
    if (event.type === "dismissed") {
      setIsDatePickerVisible(false);
      return;
    }

    if (selectedValue) {
      setValue("date", formatDateInputValue(selectedValue), {
        shouldValidate: true,
      });
    }

    setIsDatePickerVisible(false);
  };

  const handleParseTransactionText = async () => {
    if (!token) {
      setAiError(t("add.aiSessionExpired"));
      return;
    }

    if (!aiPrompt.trim()) {
      setAiError(t("add.aiPromptRequired"));
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
          ? t("add.aiSummaryReview", {
              fields: parsed.missingFields.join(", "),
            })
          : t("add.aiSummaryDone")
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setAiError(error.message);
      } else {
        setAiError(t("add.aiParseError"));
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
        setServerError(t("add.saveError"));
      }
    }
  });

  return (
    <Screen padded={false}>
      <ScrollView
        className="flex-1 bg-sand-100"
        contentContainerClassName="gap-6 px-4 py-4"
      >
        <View className="-mx-4 rounded-b-[28px] bg-forest-500 px-4 pb-6 pt-2">
          <View className="gap-2">
            <Text className="text-3xl font-semibold text-white">{t("add.title")}</Text>
            <Text className="text-sm text-white/90">{t("add.subtitle")}</Text>
          </View>
        </View>

        <View className="rounded-2xl border border-accent-500/20 bg-accent-100 p-5 shadow-card">
          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-lg font-medium text-accent-500">
                ✦ {t("add.aiParserTitle")}
              </Text>
              <Text className="text-base leading-7 text-ink-700">
                {t("add.aiParserSubtitle")}
              </Text>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-ink-900">
                {t("add.quickExamples")}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {aiExamples.map((example) => (
                  <FilterChip
                    key={example}
                    tone="accent"
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
              label={t("add.describeTransaction")}
              value={aiPrompt}
              onChangeText={setAiPrompt}
              placeholder={t("add.describePlaceholder")}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {aiError ? (
              <FeedbackCard
                title={t("add.aiFailedTitle")}
                message={aiError}
                tone="error"
              />
            ) : null}

            {aiConfidence !== null ? (
              <View className="rounded-2xl border border-sand-200 bg-sand-50 px-4 py-3">
                <Text className="text-sm font-semibold text-ink-900">
                  {t("add.aiConfidence")}
                </Text>
                <Text className="mt-1 text-base text-ink-700">
                  {t("add.aiConfidenceMessage", {
                    percent: Math.round(aiConfidence * 100),
                  })}
                </Text>
              </View>
            ) : null}

            {aiMissingFields.length > 0 ? (
              <View className="rounded-2xl border border-sand-200 bg-sand-50 px-4 py-3">
                <Text className="text-sm font-semibold text-ink-900">
                  {t("add.aiNeedsReview")}
                </Text>
                <Text className="mt-1 text-base text-ink-700">
                  {aiMissingFields.join(", ")}
                </Text>
              </View>
            ) : null}

            {aiSummary ? (
              <FeedbackCard
                title={t("add.aiCompleteTitle")}
                message={aiSummary}
              />
            ) : null}

            <View className="flex-row gap-3">
              <View className="flex-1">
                <PrimaryButton
                  label={isParsing ? t("add.parsing") : t("add.fillWithAI")}
                  tone="accent"
                  onPress={handleParseTransactionText}
                  disabled={isParsing}
                />
              </View>
              <View className="flex-1">
                <PrimaryButton
                  label={t("add.clear")}
                  variant="ghost"
                  tone="dark"
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
        </View>

        <Panel>
          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-base font-medium text-ink-900">{t("add.type")}</Text>
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
                  label={t("add.amount")}
                  keyboardType="decimal-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder={t("add.amountPlaceholder")}
                  error={errors.amount?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label={t("add.category")}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder={t("add.categoryPlaceholder")}
                  error={errors.category?.message}
                />
              )}
            />

            <View className="gap-2">
              <Text className="text-sm font-semibold text-ink-900">
                {t("add.paymentMethod")}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {(["cash", "online"] as const).map((value) => (
                  <FilterChip
                    key={value}
                    tone="blue"
                    label={value === "cash" ? t("paymentMethod.cash") : t("paymentMethod.online")}
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
              render={({ field: { value } }) => (
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-ink-900">
                    {t("add.date")}
                  </Text>
                  <Pressable
                    onPress={() => setIsDatePickerVisible(true)}
                    className="min-h-[52px] justify-center rounded-xl border border-sand-300 bg-sand-200 px-4 py-3"
                  >
                    <Text className="text-base text-ink-900">
                      {parseDateInputValue(value).toLocaleDateString(
                        language === "hi" ? "hi-IN" : "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </Text>
                  </Pressable>
                  {errors.date?.message ? (
                    <Text className="text-sm font-medium text-coral-500">
                      {errors.date.message}
                    </Text>
                  ) : null}
                  {isDatePickerVisible ? (
                    <DateTimePicker
                      value={parseDateInputValue(value)}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                      maximumDate={new Date(2100, 11, 31)}
                    />
                  ) : null}
                </View>
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label={t("add.description")}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder={t("add.descriptionPlaceholder")}
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
                    label={t("add.person")}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder={t("add.personPlaceholder")}
                    error={errors.person?.message}
                  />
                )}
              />
            ) : null}

            {serverError ? (
              <FeedbackCard
                title={t("add.saveFailedTitle")}
                message={serverError}
                tone="error"
              />
            ) : null}

            <PrimaryButton
              label={isSubmitting ? t("add.saving") : t("add.save")}
              tone="green"
              onPress={onSubmit}
              disabled={isSubmitting}
            />
          </View>
        </Panel>
      </ScrollView>
    </Screen>
  );
}
