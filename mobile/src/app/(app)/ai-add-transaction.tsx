import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

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
  RecordedAudioPayload,
} from "@/types/transaction";

const aiExamples = [
  "Paid 300 cash for lunch today",
  "Received 25000 salary online today",
  "Sent 1500 online to Rahul for rent",
];

const getFriendlyVoiceErrorMessage = (message: string) => {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("input_audio") ||
    normalizedMessage.includes("audio") ||
    normalizedMessage.includes("unsupported")
  ) {
    return "Voice transcription is not supported by the current AI model or audio format. Try the text prompt for now, or switch to a model that supports audio input on OpenRouter.";
  }

  if (
    normalizedMessage.includes("quota exceeded") ||
    normalizedMessage.includes("rate limit")
  ) {
    return "Voice transcription is temporarily busy right now. Please wait a moment and try again.";
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
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const createTransaction = useTransactionStore((state) => state.createTransaction);
  const isCreating = useTransactionStore((state) => state.isCreating);
  const [prompt, setPrompt] = useState("");
  const [parseError, setParseError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [parsedTransaction, setParsedTransaction] = useState<ParsedTransaction | null>(
    null
  );

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

  const blobToBase64 = async (blob: Blob) => {
    return new Promise<RecordedAudioPayload>((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const result = reader.result;

        if (typeof result !== "string") {
          reject(new Error("Unable to read recorded audio."));
          return;
        }

        const [, base64 = ""] = result.split(",");
        resolve({
          base64,
          mimeType: blob.type || "audio/mp4",
        });
      };

      reader.onerror = () => reject(new Error("Unable to read recorded audio."));
      reader.readAsDataURL(blob);
    });
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
      setParseError("Voice recording is available in the mobile app, not the web build.");
      return;
    }

    try {
      setParseError("");

      if (!recorderState.isRecording) {
        const permission = await requestRecordingPermissionsAsync();

        if (!permission.granted) {
          setParseError("Microphone permission is required for voice input.");
          return;
        }

        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });
        await recorder.prepareToRecordAsync();
        recorder.record();
        return;
      }

      await recorder.stop();
      await setAudioModeAsync({
        allowsRecording: false,
      });

      if (!token) {
        setParseError("Your session has expired. Please sign in again.");
        return;
      }

      const recordingUri = recorder.uri;

      if (!recordingUri) {
        setParseError("No recorded audio was found.");
        return;
      }

      setIsTranscribing(true);
      setParsedTransaction(null);

      const audioResponse = await fetch(recordingUri);
      const audioBlob = await audioResponse.blob();
      const recordedAudio = await blobToBase64(audioBlob);

      const transcriptionResponse = await aiService.transcribeAudio(token, {
        audioBase64: recordedAudio.base64,
        mimeType: recordedAudio.mimeType,
      });

      const transcript = transcriptionResponse.data.transcript.trim();

      if (!transcript) {
        setParseError("No speech was detected. Please try again.");
        return;
      }

      setPrompt(transcript);
      await parsePromptText(transcript);
    } catch (error) {
      if (error instanceof ApiError) {
        setParseError(getFriendlyVoiceErrorMessage(error.message));
      } else {
        setParseError("Unable to transcribe your voice note right now.");
      }
    } finally {
      setIsTranscribing(false);
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
                    recorderState.isRecording
                      ? "Stop Recording"
                      : isTranscribing
                        ? "Transcribing..."
                        : "Use Microphone"
                  }
                  variant="ghost"
                  onPress={handleMicPress}
                  disabled={isTranscribing}
                />
              </View>
              {(recorderState.isRecording || isTranscribing) ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator color="#1f6f5f" />
                  <Text className="text-sm font-medium text-forest-700">
                    {recorderState.isRecording
                      ? `${Math.round(recorderState.durationMillis / 1000)}s`
                      : "Processing"}
                  </Text>
                </View>
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
