import { PropsWithChildren } from "react";
import { SafeAreaView, View } from "react-native";

type ScreenProps = PropsWithChildren<{
  padded?: boolean;
}>;

export default function Screen({ children, padded = true }: ScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-sand-100">
      <View className={padded ? "flex-1 px-5 py-4" : "flex-1"}>{children}</View>
    </SafeAreaView>
  );
}
