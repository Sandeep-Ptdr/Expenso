import { http } from "@/services/api/http";
import type {
  AskAssistantPayload,
  AskAssistantResponse,
  MonthlyInsightsPayload,
  MonthlyInsightsResponse,
  ParseTransactionTextPayload,
  ParseTransactionTextResponse,
  TranscribeAudioPayload,
  TranscribeAudioResponse,
} from "@/types/transaction";

export const aiService = {
  askAssistant(token: string, payload: AskAssistantPayload) {
    return http<AskAssistantResponse>("/ai/ask", {
      method: "POST",
      token,
      body: payload,
    });
  },

  getMonthlyInsights(token: string, payload: MonthlyInsightsPayload) {
    return http<MonthlyInsightsResponse>("/ai/monthly-insights", {
      method: "POST",
      token,
      body: payload,
    });
  },

  transcribeAudio(token: string, payload: TranscribeAudioPayload) {
    return http<TranscribeAudioResponse>("/ai/transcribe-audio", {
      method: "POST",
      token,
      body: payload,
    });
  },

  parseTransactionText(token: string, payload: ParseTransactionTextPayload) {
    return http<ParseTransactionTextResponse>("/ai/parse-transaction", {
      method: "POST",
      token,
      body: payload,
    });
  },
};
