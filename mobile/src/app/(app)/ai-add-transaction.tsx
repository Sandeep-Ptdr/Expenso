import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

import FeedbackCard from "@/components/ui/FeedbackCard";
import FilterChip from "@/components/ui/FilterChip";
import FormInput from "@/components/ui/FormInput";
import Panel from "@/components/ui/Panel";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Screen from "@/components/ui/Screen";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { aiService } from "@/services/ai/ai.service";
import { ApiError } from "@/services/api/http";
import { useTransactionStore } from "@/store/transaction-store";
import type {
  CreateTransactionPayload,
  ParsedTransaction,
} from "@/types/transaction";
import { TranslationKey } from "@/i18n/translations";

const aiExamples = [
  "Paid 300 cash for lunch today",
  "Received 25000 salary online today",
  "Sent 1500 online to Rahul for rent",
];

const getFriendlyVoiceErrorMessage = (
  message: string,
  t: (key: TranslationKey) => string
) => {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("not-allowed")) {
    return t("aiQuick.micPermission");
  }

  if (
    normalizedMessage.includes("service-not-allowed") ||
    normalizedMessage.includes("recognition unavailable")
  ) {
    return t("aiQuick.speechUnavailable");
  }

  if (
    normalizedMessage.includes("language-not-supported") ||
    normalizedMessage.includes("locale")
  ) {
    return "Speech recognition does not support the selected language on this device.";
  }

  if (normalizedMessage.includes("no-speech")) {
    return t("aiQuick.noSpeech");
  }

  if (
    normalizedMessage.includes("network") ||
    normalizedMessage.includes("busy") ||
    normalizedMessage.includes("server")
  ) {
    return t("aiQuick.temporarilyUnavailable");
  }

  return message;
};

const buildCreatePayload = (
  parsedTransaction: ParsedTransaction
): CreateTransactionPayload | null => {
  if (
    !parsedTransaction.type ||
    parsedTransaction.amount === null ||
    !parsedTransaction.category ||
    !parsedTransaction.paymentMethod ||
    !parsedTransaction.date
  ) {
    return null;
  }

  return {
    type: parsedTransaction.type,
    amount: parsedTransaction.amount,
    category: parsedTransaction.category,
    paymentMethod: parsedTransaction.paymentMethod,
    description: parsedTransaction.description || "",
    date: new Date(parsedTransaction.date).toISOString(),
    person: parsedTransaction.person || "",
  };
};

export default function AiAddTransactionScreen() {
  const { formatCurrency, language, t } = useI18n();
  const router = useRouter();
  const { token } = useAuth();
  const createTransaction = useTransactionStore((state) => state.createTransaction);
  const isCreating = useTransactionStore((state) => state.isCreating);
  const [prompt, setPrompt] = useState("");
  const [parseError, setParseError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [parsedTransaction, setParsedTransaction] = useState<ParsedTransaction | null>(
    null
  );

  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
    setParseError("");
  });

  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results?.[0]?.transcript?.trim();

    if (transcript) {
      setPrompt(transcript);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    setIsListening(false);

    if (event.error === "aborted") {
      return;
    }

    setParseError(getFriendlyVoiceErrorMessage(event.message || event.error, t));
  });

  const parsePromptText = async (text: string) => {
    if (!token) {
      setParseError(t("aiQuick.aiSessionExpired"));
      return;
    }

    if (!text.trim()) {
      setParseError(t("aiQuick.promptRequired"));
      return;
    }

    const response = await aiService.parseTransactionText(token, {
      text: text.trim(),
      timezone: "Asia/Calcutta",
    });

    setParsedTransaction(response.data.parsedTransaction);
  };

  const handleParse = async () => {
    try {
      setIsParsing(true);
      setParseError("");
      setSaveError("");
      await parsePromptText(prompt);
    } catch (error) {
      if (error instanceof ApiError) {
        setParseError(error.message);
      } else {
        setParseError(t("aiQuick.parseError"));
      }
    } finally {
      setIsParsing(false);
    }
  };

  const handleMicPress = async () => {
    if (Platform.OS === "web") {
      setParseError(t("aiQuick.webMicOnly"));
      return;
    }

    try {
      setParseError("");
      setParsedTransaction(null);

      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        setParseError(
          t("aiQuick.speechUnavailable")
        );
        return;
      }

      if (!isListening) {
        const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

        if (!permission.granted) {
          setParseError(t("aiQuick.micPermission"));
          return;
        }

        ExpoSpeechRecognitionModule.start({
          lang: language === "hi" ? "hi-IN" : "en-US",
          interimResults: true,
          continuous: false,
          maxAlternatives: 1,
          addsPunctuation: true,
        });
        return;
      }

      ExpoSpeechRecognitionModule.stop();
    } catch (error) {
      if (error instanceof Error) {
        setParseError(getFriendlyVoiceErrorMessage(error.message, t));
      } else {
        setParseError(t("aiQuick.startVoiceError"));
      }
    }
  };

  const handleSave = async () => {
    if (!parsedTransaction) {
      setSaveError(t("aiQuick.saveRequiresParse"));
      return;
    }

    const payload = buildCreatePayload(parsedTransaction);

    if (!payload) {
      setSaveError(
        t("aiQuick.saveNeedsMore")
      );
      return;
    }

    try {
      setSaveError("");
      await createTransaction(payload);
      router.back();
    } catch (error) {
      if (error instanceof ApiError) {
        setSaveError(error.message);
      } else {
        setSaveError(t("aiQuick.saveError"));
      }
    }
  };

  const isSaveReady = Boolean(buildCreatePayload(parsedTransaction ?? ({} as ParsedTransaction)));

  return (
    <Screen padded={false}>
      <ScrollView
        className="flex-1 bg-sand-100"
        contentContainerClassName="gap-6 px-5 py-4"
      >
        <View className="gap-2">
          <Text className="text-3xl font-bold text-ink-900">{t("aiQuick.title")}</Text>
          <Text className="text-base leading-7 text-ink-700">
            {t("aiQuick.subtitle")}
          </Text>
        </View>

        <Panel>
          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-semibold text-ink-900">
                {t("aiQuick.examplePrompts")}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {aiExamples.map((example) => (
                  <FilterChip
                    key={example}
                    label={example}
                    onPress={() => {
                      setPrompt(example);
                      setParseError("");
                    }}
                  />
                ))}
              </View>
            </View>

            <FormInput
              label={t("aiQuick.describeLabel")}
              value={prompt}
              onChangeText={setPrompt}
              placeholder={t("aiQuick.describePlaceholder")}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View className="flex-row items-center gap-3">
              <View className="flex-1">
                <PrimaryButton
                  label={isListening ? t("aiQuick.stopListening") : t("aiQuick.useMic")}
                  variant="ghost"
                  onPress={handleMicPress}
                  disabled={false}
                />
              </View>
              {isListening ? (
                <Text className="text-sm font-medium text-forest-700">
                  {t("aiQuick.listening")}
                </Text>
              ) : null}
            </View>

            {parseError ? (
              <FeedbackCard
                title={t("aiQuick.aiFailedTitle")}
                message={parseError}
                tone="error"
              />
            ) : null}

            <PrimaryButton
              label={isParsing ? t("add.parsing") : t("aiQuick.parseTransaction")}
              onPress={handleParse}
              disabled={isParsing}
            />
          </View>
        </Panel>

        {parsedTransaction ? (
          <Panel>
            <View className="gap-4">
              <View className="gap-2">
                <Text className="text-lg font-semibold text-ink-900">
                  {t("aiQuick.suggestionTitle")}
                </Text>
                <Text className="text-base leading-7 text-ink-700">
                  {t("aiQuick.suggestionSubtitle")}
                </Text>
              </View>

              <View className="gap-3">
                <Text className="text-base text-ink-900">
                  {t("aiQuick.type")}:{" "}
                  <Text className="font-semibold">
                    {parsedTransaction.type
                      ? parsedTransaction.type === "income"
                        ? t("transactionType.income")
                        : parsedTransaction.type === "expense"
                          ? t("transactionType.expense")
                          : t("transactionType.transfer")
                      : t("common.missing")}
                  </Text>
                </Text>
                <Text className="text-base text-ink-900">
                  {t("aiQuick.amount")}:{" "}
                  <Text className="font-semibold">
                    {parsedTransaction.amount !== null
                      ? formatCurrency(parsedTransaction.amount)
                      : t("common.missing")}
                  </Text>
                </Text>
                <Text className="text-base text-ink-900">
                  {t("aiQuick.category")}:{" "}
                  <Text className="font-semibold">
                    {parsedTransaction.category || t("common.missing")}
                  </Text>
                </Text>
                <Text className="text-base text-ink-900">
                  {t("aiQuick.paymentMethod")}:{" "}
                  <Text className="font-semibold">
                    {parsedTransaction.paymentMethod
                      ? parsedTransaction.paymentMethod === "cash"
                        ? t("paymentMethod.cash")
                        : t("paymentMethod.online")
                      : t("common.missing")}
                  </Text>
                </Text>
                <Text className="text-base text-ink-900">
                  {t("aiQuick.date")}:{" "}
                  <Text className="font-semibold">
                    {parsedTransaction.date || t("common.missing")}
                  </Text>
                </Text>
                <Text className="text-base text-ink-900">
                  {t("aiQuick.description")}:{" "}
                  <Text className="font-semibold">
                    {parsedTransaction.description || t("common.none")}
                  </Text>
                </Text>
                <Text className="text-base text-ink-900">
                  {t("aiQuick.person")}:{" "}
                  <Text className="font-semibold">
                    {parsedTransaction.person || t("common.none")}
                  </Text>
                </Text>
                <Text className="text-base text-ink-900">
                  {t("aiQuick.confidence")}:{" "}
                  <Text className="font-semibold">
                    {parsedTransaction.confidence !== null
                      ? `${Math.round(parsedTransaction.confidence * 100)}%`
                      : t("aiQuick.unknown")}
                  </Text>
                </Text>
              </View>

              {parsedTransaction.missingFields.length > 0 ? (
                <FeedbackCard
                  title={t("aiQuick.needsMoreDetailTitle")}
                  message={t("aiQuick.needsMoreDetailMessage", {
                    fields: parsedTransaction.missingFields.join(", "),
                  })}
                />
              ) : null}

              {saveError ? (
                <FeedbackCard
                  title={t("aiQuick.saveFailedTitle")}
                  message={saveError}
                  tone="error"
                />
              ) : null}

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <PrimaryButton
                    label={isCreating ? t("aiQuick.saving") : t("aiQuick.save")}
                    onPress={handleSave}
                    disabled={!isSaveReady || isCreating}
                  />
                </View>
                <View className="flex-1">
                  <PrimaryButton
                    label={t("aiQuick.openFullForm")}
                    variant="ghost"
                    onPress={() => router.push("/(app)/add-transaction")}
                    disabled={isCreating}
                  />
                </View>
              </View>
            </View>
          </Panel>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
