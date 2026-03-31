import { Redirect } from "expo-router";

import { useAuth } from "@/hooks/use-auth";
import Screen from "@/components/ui/Screen";
import { Text, View } from "react-native";

export default function Index() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base font-medium text-ink-700">
            Restoring your session...
          </Text>
        </View>
      </Screen>
    );
  }

  return <Redirect href={isAuthenticated ? "/(app)/(tabs)" : "/(auth)/login"} />;
}
