import { PropsWithChildren } from "react";
import { View } from "react-native";

export default function Panel({ children }: PropsWithChildren) {
  return (
    <View className="rounded-[28px] border border-sand-200 bg-white/95 p-5 shadow-card">
      {children}
    </View>
  );
}
