import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { useI18n } from "@/hooks/use-i18n";

export default function TabsLayout() {
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2d2d2d",
        tabBarInactiveTintColor: "#6b6b6b",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "rgba(0, 0, 0, 0.08)",
          height: 72,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.dashboard"),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "view-grid" : "view-grid-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: t("tabs.transactions"),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "format-list-bulleted" : "format-list-bulleted-type"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: t("tabs.assistant"),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "message-processing" : "message-processing-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
