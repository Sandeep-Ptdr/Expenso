import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import FeedbackCard from "@/components/ui/FeedbackCard";
import LoadingCard from "@/components/ui/LoadingCard";
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
  const contentWithCurrencySymbol = contentWithProtectedDates.replace(
    /Rs\.?\s*/g,
    "₹"
  );

  const formattedContent = contentWithCurrencySymbol.replace(
    /(?:₹\s*)?\b\d{4,}(?:\.\d+)?\b/g,
    (match) => {
      const currencyMatch = match.match(/^(₹\s*)?(.*)$/);

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

        if (/^[-*]\s+/.test(trimmedLine)) {
          const itemText = trimmedLine.replace(/^[-*]\s+/, "");

          return (
            <View key={`bullet-${index}`} className="flex-row items-start gap-2">
              <Text className="pt-0.5 text-base text-ink-900">•</Text>
              <Text className="flex-1 text-base leading-7 text-ink-900">
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
              <Text className="pt-0.5 text-base font-semibold text-ink-900">
                {match[1]}.
              </Text>
              <Text className="flex-1 text-base leading-7 text-ink-900">
                {renderInlineMarkdown(match[2], "text-ink-900")}
              </Text>
            </View>
          );
        }

        return (
          <Text key={`p-${index}`} className="text-base leading-7 text-ink-900">
            {renderInlineMarkdown(trimmedLine, "text-ink-900")}
          </Text>
        );
      })}
    </View>
  );
}

function AssistantReplyCard({ content }: { content: string }) {
  return (
    <View className="mr-8 self-start rounded-[22px] border border-sand-300 bg-white px-5 py-4 shadow-card">
      <View className="flex-row items-center gap-2">
        <MaterialCommunityIcons name="auto-fix" size={18} color="#A855F7" />
        <Text className="text-sm font-medium text-accent-500">AI Assistant</Text>
      </View>
      <AssistantMarkdown content={formatAssistantNumbers(content)} />
    </View>
  );
}

function UserMessageBubble({ content }: { content: string }) {
  return (
    <View className="ml-12 self-end rounded-[22px] rounded-br-md bg-forest-500 px-5 py-4">
      <Text className="text-[16px] font-medium leading-7 text-white">{content}</Text>
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
    "What are my recent cash transactions?",
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

  const hasChatStarted = messages.length > 0;

  return (
    <Screen padded={false}>
      <View className="flex-1 bg-sand-100">
        <LinearGradient
          colors={["#A855F7", "#EC4899"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          className="rounded-b-[30px] px-5 pb-8 pt-5"
          style={{overflow: "hidden"}}
        >
          <View className="flex-row items-start justify-between gap-4">
            <View className="gap-2">
              <Text className="text-[24px] font-semibold text-white">{t("assistant.title")}</Text>
              <Text className="text-base text-white/95">Ask me about your finances</Text>
            </View>

            {hasChatStarted ? (
              <Pressable
                onPress={handleClearConversation}
                className="h-11 w-11 items-center justify-center rounded-full bg-white/20"
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={22}
                  color="#ffffff"
                />
              </Pressable>
            ) : null}
          </View>
        </LinearGradient>

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-5 px-4 py-5"
          keyboardShouldPersistTaps="handled"
        >
          {!hasChatStarted ? (
            <View className="gap-6">
              <View className="items-center gap-4 pt-2">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-accent-100">
                  <MaterialCommunityIcons
                    name="auto-fix"
                    size={34}
                    color="#A855F7"
                  />
                </View>
                <View className="items-center gap-2">
                  <Text className="text-[22px] font-medium text-ink-900">Ask Me Anything</Text>
                  <Text className="text-center text-[16px] leading-8 text-ink-700">
                    I can help you understand your spending patterns, track expenses,
                    and provide insights
                  </Text>
                </View>
              </View>

              <View className="gap-3">
                <Text className="text-[16px] font-medium text-ink-700">Try asking:</Text>
                <View className="gap-3">
                  {assistantExamples.map((example) => (
                    <Pressable
                      key={example}
                      onPress={() => {
                        setQuestion(example);
                        setError("");
                      }}
                      className="rounded-[20px] border border-[#E9D5FF] bg-[#FAF5FF] px-5 py-4"
                    >
                      <Text className="text-[16px] font-medium leading-6 text-[#6B21A8]">
                        {example}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <View className="gap-5">
              {transactionsAnalyzed !== null ? (
                <View className="self-start rounded-full bg-accent-100 px-4 py-2">
                  <Text className="text-sm font-medium text-accent-500">
                    Based on {transactionsAnalyzed} transactions
                  </Text>
                </View>
              ) : null}

              {isConversationLoading ? (
                <LoadingCard label="Loading assistant conversation..." />
              ) : (
                <View className="gap-5">
                  {messages.map((message) =>
                    message.role === "user" ? (
                      <UserMessageBubble key={message.id} content={message.content} />
                    ) : (
                      <AssistantReplyCard key={message.id} content={message.content} />
                    )
                  )}
                </View>
              )}
            </View>
          )}

          {error ? (
            <FeedbackCard
              title={t("assistant.unavailable")}
              message={error}
              tone="error"
            />
          ) : null}
        </ScrollView>

        <View className="border-t border-sand-300 bg-white px-4 pb-5 pt-4">
          <View className="flex-row items-center gap-3">
            <View className="flex-1 rounded-[20px] bg-sand-200 px-5 py-2">
              <TextInput
                value={question}
                onChangeText={setQuestion}
                placeholder="Ask about your finances..."
                placeholderTextColor="#8d877e"
                multiline
                className="min-h-[48px] text-[16px] text-ink-900"
                textAlignVertical="center"
              />
            </View>

            <Pressable
              onPress={() => handleAskAssistant(false)}
              disabled={isLoading}
              accessibilityRole="button"
              className="h-16 w-16 items-center justify-center rounded-[20px]"
              style={({ pressed }) => ({
                opacity: isLoading ? 0.6 : pressed ? 0.94 : 1,
                transform: [{ scale: pressed && !isLoading ? 0.98 : 1 }],
              })}
            >
              <LinearGradient
                colors={["#D8B4FE", "#EC4899"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                className="h-16 w-16 items-center justify-center rounded-[20px]"
                style={{overflow: "hidden"}}
              >
                <MaterialCommunityIcons
                  name={isLoading ? "loading" : "send-outline"}
                  size={24}
                  color="#ffffff"
                />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </Screen>
  );
}
