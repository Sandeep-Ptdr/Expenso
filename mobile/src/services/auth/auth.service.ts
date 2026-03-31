import { http } from "@/services/api/http";
import type {
  AuthResponse,
  LoginPayload,
  MeResponse,
  RegisterPayload,
} from "@/types/auth";

export const authService = {
  login(payload: LoginPayload) {
    return http<AuthResponse>("/auth/login", {
      method: "POST",
      body: payload,
    });
  },

  register(payload: RegisterPayload) {
    return http<AuthResponse>("/auth/register", {
      method: "POST",
      body: payload,
    });
  },

  getCurrentUser(token: string) {
    return http<MeResponse>("/auth/me", {
      token,
    });
  },
};
