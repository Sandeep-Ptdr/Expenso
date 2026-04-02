import { Tabs } from "expo-router";

import { useI18n } from "@/hooks/use-i18n";

export default function TabsLayout() {
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1f6f5f",
        tabBarInactiveTintColor: "#7b756d",
        tabBarStyle: {
          backgroundColor: "#fffdf9",
          borderTopColor: "#e8dfd1",
          height: 68,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.dashboard"),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: t("tabs.transactions"),
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: t("tabs.assistant"),
        }}
      />
    </Tabs>
  );
}
