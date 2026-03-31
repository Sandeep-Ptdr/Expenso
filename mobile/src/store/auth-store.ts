import { create } from "zustand";

import { storage } from "@/lib/storage";
import { authService } from "@/services/auth/auth.service";
import type { AuthUser, LoginPayload, RegisterPayload } from "@/types/auth";

const AUTH_TOKEN_KEY = "expense-manager-auth-token";

type AuthStore = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  isSubmitting: boolean;
  bootstrap: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const persistSession = async (token: string, user: AuthUser) => {
  await storage.setItem(AUTH_TOKEN_KEY, token);

  useAuthStore.setState({
    token,
    user,
    isAuthenticated: true,
  });
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isBootstrapping: true,
  isSubmitting: false,

  bootstrap: async () => {
    try {
      const storedToken = await storage.getItem(AUTH_TOKEN_KEY);

      if (!storedToken) {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isBootstrapping: false,
        });
        return;
      }

      const response = await authService.getCurrentUser(storedToken);

      set({
        token: storedToken,
        user: response.data.user,
        isAuthenticated: true,
        isBootstrapping: false,
      });
    } catch (error) {
      await storage.removeItem(AUTH_TOKEN_KEY);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isBootstrapping: false,
      });
    }
  },

  login: async (payload) => {
    set({ isSubmitting: true });

    try {
      const response = await authService.login(payload);
      await persistSession(response.data.token, response.data.user);
    } finally {
      set({ isSubmitting: false });
    }
  },

  register: async (payload) => {
    set({ isSubmitting: true });

    try {
      const response = await authService.register(payload);
      await persistSession(response.data.token, response.data.user);
    } finally {
      set({ isSubmitting: false });
    }
  },

  logout: async () => {
    await storage.removeItem(AUTH_TOKEN_KEY);

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));
