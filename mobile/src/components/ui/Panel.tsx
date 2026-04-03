import { PropsWithChildren } from "react";
import { View } from "react-native";

export default function Panel({ children }: PropsWithChildren) {
  return (
    <View className="rounded-2xl border border-sand-300 bg-white p-5 shadow-card">
      {children}
    </View>
  );
}
