import { ActivityIndicator, Text, View } from "react-native";

import Panel from "@/components/ui/Panel";

export default function LoadingCard({ label }: { label: string }) {
  return (
    <Panel>
      <View className="flex-row items-center gap-3 rounded-xl bg-sand-100 px-4 py-4">
        <ActivityIndicator color="#10b981" />
        <Text className="text-base font-medium text-ink-700">{label}</Text>
      </View>
    </Panel>
  );
}
