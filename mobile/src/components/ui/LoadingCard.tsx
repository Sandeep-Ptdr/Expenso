import { ActivityIndicator, Text, View } from "react-native";

import Panel from "@/components/ui/Panel";

export default function LoadingCard({ label }: { label: string }) {
  return (
    <Panel>
      <View className="flex-row items-center gap-3">
        <ActivityIndicator color="#1f6f5f" />
        <Text className="text-base font-medium text-ink-700">{label}</Text>
      </View>
    </Panel>
  );
}
