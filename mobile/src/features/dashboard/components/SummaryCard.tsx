import { Text, View } from "react-native";

type SummaryCardProps = {
  label: string;
  value: string;
  accent: "green" | "orange" | "neutral";
};

const accentMap = {
  green: "bg-forest-500/10 text-forest-700",
  orange: "bg-coral-500/10 text-coral-500",
  neutral: "bg-sand-200 text-ink-900",
};

export default function SummaryCard({
  label,
  value,
  accent,
}: SummaryCardProps) {
  return (
    <View className="flex-1 rounded-[24px] border border-sand-200 bg-white px-4 py-5">
      <Text className="text-sm font-medium text-ink-700">{label}</Text>
      <Text className="mt-3 text-2xl font-bold text-ink-900">{value}</Text>
      <View className={`mt-4 self-start rounded-full px-3 py-1 ${accentMap[accent]}`}>
        <Text className="text-xs font-semibold">
          {accent === "green"
            ? "On track"
            : accent === "orange"
              ? "Needs attention"
              : "Overview"}
        </Text>
      </View>
    </View>
  );
}
