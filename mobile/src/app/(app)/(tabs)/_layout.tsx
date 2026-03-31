import { Tabs } from "expo-router";

export default function TabsLayout() {
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
          title: "Dashboard",
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: "Assistant",
        }}
      />
    </Tabs>
  );
}
