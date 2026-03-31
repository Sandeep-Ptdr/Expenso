import { Redirect, Stack } from "expo-router";

import Screen from "@/components/ui/Screen";
import { useAuth } from "@/hooks/use-auth";

export default function AppLayout() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <Screen>
        <></>
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="add-transaction"
        options={{
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
