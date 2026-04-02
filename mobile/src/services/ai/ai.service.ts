import { http } from "@/services/api/http";
import type {
  AskAssistantPayload,
  AssistantConversationResponse,
  AskAssistantResponse,
  MonthlyInsightsPayload,
  MonthlyInsightsResponse,
  ParseTransactionTextPayload,
  ParseTransactionTextResponse,
  TranscribeAudioPayload,
  TranscribeAudioResponse,
} from "@/types/transaction";

export const aiService = {
  getAssistantConversation(token: string) {
    return http<AssistantConversationResponse>("/ai/conversation", {
      method: "GET",
      token,
    });
  },

  clearAssistantConversation(token: string) {
    return http<AssistantConversationResponse>("/ai/conversation", {
      method: "DELETE",
      token,
    });
  },

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
