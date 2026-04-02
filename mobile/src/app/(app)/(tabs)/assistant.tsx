import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

import FeedbackCard from "@/components/ui/FeedbackCard";
import FilterChip from "@/components/ui/FilterChip";
import FormInput from "@/components/ui/FormInput";
import LoadingCard from "@/components/ui/LoadingCard";
import Panel from "@/components/ui/Panel";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Screen from "@/components/ui/Screen";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { aiService } from "@/services/ai/ai.service";
import { ApiError } from "@/services/api/http";
import type { AssistantMessage } from "@/types/transaction";

const getFriendlyAssistantError = (message: string) => {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("quota exceeded") ||
    normalizedMessage.includes("rate limit")
  ) {
    return "Assistant is temporarily busy right now. Please wait a moment and try again.";
  }

  return message;
};

const formatStandaloneNumber = (numericPart: string) => {
  const value = Number(numericPart);

  if (Number.isNaN(value)) {
    return numericPart;
  }

  return numericPart.includes(".")
    ? value.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    : value.toLocaleString("en-IN");
};

const formatAssistantNumbers = (content: string) => {
  const protectedSegments: string[] = [];
  const contentWithProtectedDates = content.replace(
    /\b\d{4}-\d{2}-\d{2}\b/g,
    (match) => {
      const token = `__DATE_${protectedSegments.length}__`;
      protectedSegments.push(match);
      return token;
    }
  );

  const formattedContent = contentWithProtectedDates.replace(
    /(?:Rs\.?\s*)?\b\d{4,}(?:\.\d+)?\b/g,
    (match) => {
      const currencyMatch = match.match(/^(Rs\.?\s*)?(.*)$/);

      if (!currencyMatch) {
        return match;
      }

      const [, prefix = "", numericPart = ""] = currencyMatch;

      if (!numericPart || numericPart.includes(",")) {
        return match;
      }

      return `${prefix}${formatStandaloneNumber(numericPart)}`;
    }
  );

  return formattedContent.replace(/__DATE_(\d+)__/g, (_, index: string) => {
    return protectedSegments[Number(index)] || "";
  });
};

const renderInlineMarkdown = (text: string, colorClassName: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <Text key={`${part}-${index}`} className={`font-bold ${colorClassName}`}>
          {part.slice(2, -2)}
        </Text>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <Text
          key={`${part}-${index}`}
          className={`rounded-md bg-sand-100 px-1 py-0.5 font-medium ${colorClassName}`}
        >
          {part.slice(1, -1)}
        </Text>
      );
    }

    return (
      <Text key={`${part}-${index}`} className={colorClassName}>
        {part}
      </Text>
    );
  });
};

function AssistantMarkdown({ content }: { content: string }) {
  const lines = content.split("\n").filter((line, index, source) => {
    if (line.trim().length > 0) {
      return true;
    }

    const previousLine = source[index - 1];
    return Boolean(previousLine && previousLine.trim().length > 0);
  });

  return (
    <View className="mt-2 gap-2">
      {lines.map((rawLine, index) => {
        const line = rawLine.trimEnd();
        const trimmedLine = line.trim();

        if (!trimmedLine) {
          return <View key={`spacer-${index}`} className="h-1" />;
        }

        if (trimmedLine.startsWith("### ")) {
          return (
            <Text key={`h3-${index}`} className="text-base font-bold text-ink-900">
              {trimmedLine.slice(4)}
            </Text>
          );
        }

        if (trimmedLine.startsWith("## ")) {
          return (
            <Text key={`h2-${index}`} className="text-lg font-bold text-ink-900">
              {trimmedLine.slice(3)}
            </Text>
          );
        }

        if (trimmedLine.startsWith("# ")) {
          return (
            <Text key={`h1-${index}`} className="text-xl font-bold text-ink-900">
              {trimmedLine.slice(2)}
            </Text>
          );
        }

        if (/^[-*]\s+/.test(trimmedLine)) {
          const itemText = trimmedLine.replace(/^[-*]\s+/, "");

          return (
            <View key={`bullet-${index}`} className="flex-row items-start gap-2">
              <Text className="pt-0.5 text-base text-forest-700">•</Text>
              <Text className="flex-1 text-base leading-6 text-ink-900">
                {renderInlineMarkdown(itemText, "text-ink-900")}
              </Text>
            </View>
          );
        }

        if (/^\d+\.\s+/.test(trimmedLine)) {
          const match = trimmedLine.match(/^(\d+)\.\s+(.*)$/);

          if (!match) {
            return null;
          }

          return (
            <View key={`ordered-${index}`} className="flex-row items-start gap-2">
              <Text className="pt-0.5 text-base font-semibold text-forest-700">
                {match[1]}.
              </Text>
              <Text className="flex-1 text-base leading-6 text-ink-900">
                {renderInlineMarkdown(match[2], "text-ink-900")}
              </Text>
            </View>
          );
        }

        if (trimmedLine.startsWith("> ")) {
          return (
            <View
              key={`quote-${index}`}
              className="border-l-4 border-forest-500 bg-sand-50 px-3 py-2"
            >
              <Text className="text-base leading-6 text-ink-700">
                {renderInlineMarkdown(trimmedLine.slice(2), "text-ink-700")}
              </Text>
            </View>
          );
        }

        return (
          <Text key={`p-${index}`} className="text-base leading-6 text-ink-900">
            {renderInlineMarkdown(trimmedLine, "text-ink-900")}
          </Text>
        );
      })}
    </View>
  );
}

export default function AssistantScreen() {
  const { t } = useI18n();
  const { token } = useAuth();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [error, setError] = useState("");
  const [transactionsAnalyzed, setTransactionsAnalyzed] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isConversationLoading, setIsConversationLoading] = useState(true);
  const assistantExamples = [
    t("assistant.example1"),
    t("assistant.example2"),
    t("assistant.example3"),
  ];

  const loadConversation = useCallback(async () => {
    if (!token) {
      setMessages([]);
      setError("");
      setIsConversationLoading(false);
      return;
    }

    try {
      setIsConversationLoading(true);
      setError("");

      const response = await aiService.getAssistantConversation(token);
      setMessages(response.data.messages);
    } catch (loadError) {
      if (loadError instanceof ApiError) {
        setError(getFriendlyAssistantError(loadError.message));
      } else {
        setError(t("assistant.error"));
      }
    } finally {
      setIsConversationLoading(false);
    }
  }, [t, token]);

  useFocusEffect(
    useCallback(() => {
      loadConversation();
    }, [loadConversation])
  );

  const handleAskAssistant = async (resetContext = false) => {
    if (!token) {
      setError(t("assistant.sessionExpired"));
      return;
    }

    if (!question.trim()) {
      setError(t("assistant.emptyQuestion"));
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await aiService.askAssistant(token, {
        question: question.trim(),
        timezone: "Asia/Calcutta",
        resetContext,
      });

      setMessages(response.data.messages);
      setTransactionsAnalyzed(response.data.transactionsAnalyzed);
      setQuestion("");
    } catch (loadError) {
      if (loadError instanceof ApiError) {
        setError(getFriendlyAssistantError(loadError.message));
      } else {
        setError(t("assistant.error"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConversation = () => {
    Alert.alert(
      "Clear assistant chat",
      "This will remove the saved conversation context for future replies.",
      [
        {
          text: t("transactions.cancel"),
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            if (!token) {
              setError(t("assistant.sessionExpired"));
              return;
            }

            try {
              setError("");
              const response = await aiService.clearAssistantConversation(token);
              setMessages(response.data.messages);
              setTransactionsAnalyzed(null);
            } catch (clearError) {
              if (clearError instanceof ApiError) {
                setError(getFriendlyAssistantError(clearError.message));
              } else {
                setError(t("assistant.error"));
              }
            }
          },
        },
      ]
    );
  };

  return (
    <Screen padded={false}>
      <ScrollView
        className="flex-1 bg-sand-100"
        contentContainerClassName="gap-6 px-5 py-4"
      >
        <View className="gap-2">
          <Text className="text-3xl font-bold text-ink-900">{t("assistant.title")}</Text>
          <Text className="text-base leading-7 text-ink-700">
            {t("assistant.subtitle")}
          </Text>
        </View>

        <Panel>
          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-semibold text-ink-900">
                {t("assistant.suggestedQuestions")}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {assistantExamples.map((example) => (
                  <FilterChip
                    key={example}
                    label={example}
                    onPress={() => {
                      setQuestion(example);
                      setError("");
                    }}
                  />
                ))}
              </View>
            </View>

            <FormInput
              label={t("assistant.askLabel")}
              value={question}
              onChangeText={setQuestion}
              placeholder={t("assistant.askPlaceholder")}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {error ? (
              <FeedbackCard
                title={t("assistant.unavailable")}
                message={error}
                tone="error"
              />
            ) : null}

            <View className="flex-row gap-3">
              <View className="flex-1">
                <PrimaryButton
                  label={isLoading ? t("assistant.thinking") : t("assistant.askButton")}
                  onPress={() => handleAskAssistant(false)}
                  disabled={isLoading}
                />
              </View>
              <View className="flex-1">
                <PrimaryButton
                  label="Clear Chat"
                  variant="ghost"
                  onPress={handleClearConversation}
                  disabled={isLoading || messages.length === 0}
                />
              </View>
            </View>
          </View>
        </Panel>

        <Panel>
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-ink-900">
                Conversation
              </Text>
              {transactionsAnalyzed !== null ? (
                <Text className="text-sm font-medium text-forest-700">
                  Data set: {transactionsAnalyzed} transactions
                </Text>
              ) : null}
            </View>

            {isConversationLoading ? (
              <LoadingCard label="Loading assistant conversation..." />
            ) : messages.length === 0 ? (
              <FeedbackCard
                title={t("assistant.firstQuestionTitle")}
                message={t("assistant.firstQuestionMessage")}
              />
            ) : (
              <View className="gap-3">
                {messages.map((message) => (
                  <View
                    key={message.id}
                    className={
                      message.role === "user"
                        ? "self-end rounded-[24px] bg-forest-500 px-4 py-3"
                        : "self-start rounded-[24px] bg-sand-50 px-4 py-3"
                    }
                  >
                    <Text
                      className={
                        message.role === "user"
                          ? "text-sm font-semibold text-white"
                          : "text-xs font-semibold uppercase tracking-[1px] text-forest-700"
                      }
                    >
                      {message.role === "user" ? "You" : "Assistant"}
                    </Text>
                    {message.role === "user" ? (
                      <Text className="mt-2 text-base leading-6 text-white">
                        {message.content}
                      </Text>
                    ) : (
                      <AssistantMarkdown
                        content={formatAssistantNumbers(message.content)}
                      />
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </Panel>
      </ScrollView>
    </Screen>
  );
}
