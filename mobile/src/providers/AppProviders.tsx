import { ThemeProvider, DefaultTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { PropsWithChildren } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LanguageProvider } from "@/providers/LanguageProvider";
import StoreBootstrap from "@/providers/StoreBootstrap";

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#f4efe6",
    card: "#fffdf9",
    border: "#e8dfd1",
    text: "#161616",
    primary: "#1f6f5f",
  },
};

export default function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <ThemeProvider value={navigationTheme}>
          <StoreBootstrap>
            <StatusBar style="dark" />
            {children}
          </StoreBootstrap>
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
