import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

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

export default function AssistantScreen() {
  const { t } = useI18n();
  const { token } = useAuth();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [transactionsAnalyzed, setTransactionsAnalyzed] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const assistantExamples = [
    t("assistant.example1"),
    t("assistant.example2"),
    t("assistant.example3"),
  ];

  const handleAskAssistant = async () => {
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
      });

      setAnswer(response.data.answer);
      setTransactionsAnalyzed(response.data.transactionsAnalyzed);
    } catch (loadError) {
      if (loadError instanceof ApiError) {
        setError(loadError.message);
      } else {
        setError(t("assistant.error"));
      }
    } finally {
      setIsLoading(false);
    }
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

            <PrimaryButton
              label={isLoading ? t("assistant.thinking") : t("assistant.askButton")}
              onPress={handleAskAssistant}
              disabled={isLoading}
            />
          </View>
        </Panel>

        {answer ? (
          <Panel>
            <View className="gap-3">
              <Text className="text-lg font-semibold text-ink-900">
                {t("assistant.answerTitle")}
              </Text>
              <Text className="text-base leading-7 text-ink-700">{answer}</Text>
              {transactionsAnalyzed !== null ? (
                <Text className="text-sm font-medium text-forest-700">
                  {t("assistant.answerBasedOn", {
                    count: transactionsAnalyzed,
                    s: transactionsAnalyzed === 1 ? "" : "s",
                  })}
                </Text>
              ) : null}
            </View>
          </Panel>
        ) : (
          <FeedbackCard
            title={t("assistant.firstQuestionTitle")}
            message={t("assistant.firstQuestionMessage")}
          />
        )}
      </ScrollView>
    </Screen>
  );
}
