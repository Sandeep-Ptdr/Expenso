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
import { aiService } from "@/services/ai/ai.service";
import { ApiError } from "@/services/api/http";
import { useTransactionStore } from "@/store/transaction-store";
import type {
  CreateTransactionPayload,
  ParsedTransaction,
} from "@/types/transaction";

const aiExamples = [
  "Paid 300 cash for lunch today",
  "Received 25000 salary online today",
  "Sent 1500 online to Rahul for rent",
];

const getFriendlyVoiceErrorMessage = (message: string) => {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("not-allowed")) {
    return "Microphone permission is required for voice input.";
  }

  if (
    normalizedMessage.includes("service-not-allowed") ||
    normalizedMessage.includes("recognition unavailable")
  ) {
    return "Speech recognition is not available on this device right now. Please check the phone's voice input settings.";
  }

  if (
    normalizedMessage.includes("language-not-supported") ||
    normalizedMessage.includes("locale")
  ) {
    return "Speech recognition does not support the selected language on this device.";
  }

  if (normalizedMessage.includes("no-speech")) {
    return "No speech was detected. Please try again and speak a little closer to the microphone.";
  }

  if (
    normalizedMessage.includes("network") ||
    normalizedMessage.includes("busy") ||
    normalizedMessage.includes("server")
  ) {
    return "Speech recognition is temporarily unavailable. Please try again in a moment.";
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

    setParseError(getFriendlyVoiceErrorMessage(event.message || event.error));
  });

  const parsePromptText = async (text: string) => {
    if (!token) {
      setParseError("Your session has expired. Please sign in again.");
      return;
    }

    if (!text.trim()) {
      setParseError("Enter a sentence like 'Paid 300 cash for lunch today'.");
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
        setParseError("Unable to parse that transaction right now.");
      }
    } finally {
      setIsParsing(false);
    }
  };

  const handleMicPress = async () => {
    if (Platform.OS === "web") {
      setParseError("Live microphone input is available in the mobile app, not the web build.");
      return;
    }

    try {
      setParseError("");
      setParsedTransaction(null);

      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        setParseError(
          "Speech recognition is not available on this device. Please enable voice input services in system settings."
        );
        return;
      }

      if (!isListening) {
        const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

        if (!permission.granted) {
          setParseError("Microphone permission is required for voice input.");
          return;
        }

        ExpoSpeechRecognitionModule.start({
          lang: "en-US",
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
        setParseError(getFriendlyVoiceErrorMessage(error.message));
      } else {
        setParseError("Unable to start voice input right now.");
      }
    }
  };

  const handleSave = async () => {
    if (!parsedTransaction) {
      setSaveError("Parse a transaction before saving.");
      return;
    }

    const payload = buildCreatePayload(parsedTransaction);

    if (!payload) {
      setSaveError(
        "AI still needs more details. Try a clearer sentence or use the full Add Transaction form."
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
        setSaveError("Unable to save this transaction right now.");
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
          <Text className="text-3xl font-bold text-ink-900">AI Quick Add</Text>
          <Text className="text-base leading-7 text-ink-700">
            Describe a transaction naturally, review the parsed result, and save it
            in one fast flow.
          </Text>
        </View>

        <Panel>
          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-semibold text-ink-900">
                Example prompts
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
              label="Describe the transaction"
              value={prompt}
              onChangeText={setPrompt}
              placeholder="Paid 300 cash for lunch today"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View className="flex-row items-center gap-3">
              <View className="flex-1">
                <PrimaryButton
                  label={
                    isListening ? "Stop Listening" : "Use Microphone"
                  }
                  variant="ghost"
                  onPress={handleMicPress}
                  disabled={false}
                />
              </View>
              {isListening ? (
                <Text className="text-sm font-medium text-forest-700">
                  Listening...
                </Text>
              ) : null}
            </View>

            {parseError ? (
              <FeedbackCard
                title="AI parsing failed"
                message={parseError}
                tone="error"
              />
            ) : null}

            <PrimaryButton
              label={isParsing ? "Parsing..." : "Parse Transaction"}
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
                  AI Suggestion
                </Text>
                <Text className="text-base leading-7 text-ink-700">
                  Review this parsed transaction before saving it.
                </Text>
              </View>

              <View className="gap-3">
                <Text className="text-base text-ink-900">
                  Type: <Text className="font-semibold">{parsedTransaction.type || "Missing"}</Text>
                </Text>
                <Text className="text-base text-ink-900">
                  Amount:{" "}
                  <Text className="font-semibold">
                    {parsedTransaction.amount !== null
                      ? `Rs. ${parsedTransaction.amount}`
                      : "Missing"}
                  </Text>
                </Text>
                <Text className="text-base text-ink-900">
                  Category:{" "}
                  <Text className="font-semibold">
                    {parsedTransaction.category || "Missing"}
                  </Text>
                </Text>
                <Text className="text-base text-ink-900">
                  Payment Method:{" "}
                  <Text className="font-semibold">
                    {parsedTransaction.paymentMethod || "Missing"}
                  </Text>
                </Text>
                <Text className="text-base text-ink-900">
                  Date:{" "}
                  <Text className="font-semibold">
                    {parsedTransaction.date || "Missing"}
                  </Text>
                </Text>
                <Text className="text-base text-ink-900">
                  Description:{" "}
                  <Text className="font-semibold">
                    {parsedTransaction.description || "None"}
                  </Text>
                </Text>
                <Text className="text-base text-ink-900">
                  Person:{" "}
                  <Text className="font-semibold">
                    {parsedTransaction.person || "None"}
                  </Text>
                </Text>
                <Text className="text-base text-ink-900">
                  Confidence:{" "}
                  <Text className="font-semibold">
                    {parsedTransaction.confidence !== null
                      ? `${Math.round(parsedTransaction.confidence * 100)}%`
                      : "Unknown"}
                  </Text>
                </Text>
              </View>

              {parsedTransaction.missingFields.length > 0 ? (
                <FeedbackCard
                  title="Needs more detail"
                  message={`AI could not confidently fill: ${parsedTransaction.missingFields.join(", ")}`}
                />
              ) : null}

              {saveError ? (
                <FeedbackCard
                  title="Could not save transaction"
                  message={saveError}
                  tone="error"
                />
              ) : null}

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <PrimaryButton
                    label={isCreating ? "Saving..." : "Save AI Transaction"}
                    onPress={handleSave}
                    disabled={!isSaveReady || isCreating}
                  />
                </View>
                <View className="flex-1">
                  <PrimaryButton
                    label="Open Full Form"
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
