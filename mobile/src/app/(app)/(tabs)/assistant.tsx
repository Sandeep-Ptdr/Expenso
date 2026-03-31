import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import FeedbackCard from "@/components/ui/FeedbackCard";
import FilterChip from "@/components/ui/FilterChip";
import FormInput from "@/components/ui/FormInput";
import Panel from "@/components/ui/Panel";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Screen from "@/components/ui/Screen";
import { useAuth } from "@/hooks/use-auth";
import { aiService } from "@/services/ai/ai.service";
import { ApiError } from "@/services/api/http";

const assistantExamples = [
  "How much did I spend on food this month?",
  "What was my highest expense category recently?",
  "How much did I spend online versus cash this month?",
];

export default function AssistantScreen() {
  const { token } = useAuth();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [transactionsAnalyzed, setTransactionsAnalyzed] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleAskAssistant = async () => {
    if (!token) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    if (!question.trim()) {
      setError("Enter a spending question for the assistant.");
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
        setError("Unable to get an assistant answer right now.");
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
          <Text className="text-3xl font-bold text-ink-900">AI Assistant</Text>
          <Text className="text-base leading-7 text-ink-700">
            Ask questions about your spending patterns, categories, and payment
            methods based on your saved transactions.
          </Text>
        </View>

        <Panel>
          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-semibold text-ink-900">
                Suggested questions
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
              label="Ask the assistant"
              value={question}
              onChangeText={setQuestion}
              placeholder="How much did I spend on food this month?"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {error ? (
              <FeedbackCard
                title="Assistant unavailable"
                message={error}
                tone="error"
              />
            ) : null}

            <PrimaryButton
              label={isLoading ? "Thinking..." : "Ask Assistant"}
              onPress={handleAskAssistant}
              disabled={isLoading}
            />
          </View>
        </Panel>

        {answer ? (
          <Panel>
            <View className="gap-3">
              <Text className="text-lg font-semibold text-ink-900">
                Assistant Answer
              </Text>
              <Text className="text-base leading-7 text-ink-700">{answer}</Text>
              {transactionsAnalyzed !== null ? (
                <Text className="text-sm font-medium text-forest-700">
                  Based on {transactionsAnalyzed} recent transaction
                  {transactionsAnalyzed === 1 ? "" : "s"}.
                </Text>
              ) : null}
            </View>
          </Panel>
        ) : (
          <FeedbackCard
            title="Ask your first question"
            message="Try asking about monthly food spending, payment method breakdowns, or your top expense category."
          />
        )}
      </ScrollView>
    </Screen>
  );
}
