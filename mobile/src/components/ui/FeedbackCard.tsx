import { ReactNode } from "react";
import { Text, View } from "react-native";

import Panel from "@/components/ui/Panel";
import PrimaryButton from "@/components/ui/PrimaryButton";

type FeedbackCardProps = {
  title: string;
  message: string;
  tone?: "neutral" | "error";
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
};

export default function FeedbackCard({
  title,
  message,
  tone = "neutral",
  actionLabel,
  onAction,
  icon,
}: FeedbackCardProps) {
  return (
    <Panel>
      <View className="gap-3">
        {icon ? <View>{icon}</View> : null}
        <Text
          className={`text-lg font-semibold ${
            tone === "error" ? "text-coral-500" : "text-ink-900"
          }`}
        >
          {title}
        </Text>
        <Text className="text-base leading-7 text-ink-700">{message}</Text>
        {actionLabel && onAction ? (
          <PrimaryButton label={actionLabel} onPress={onAction} variant="ghost" />
        ) : null}
      </View>
    </Panel>
  );
}
