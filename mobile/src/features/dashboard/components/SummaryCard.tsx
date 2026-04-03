import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type SummaryCardProps = {
  label: string;
  value: string;
  accent: "green" | "orange" | "neutral";
};

type SummaryIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const accentMap: Record<
  SummaryCardProps["accent"],
  {
    card: string;
    icon: SummaryIconName;
    iconWrap: string;
    label: string;
    value: string;
  }
> = {
  green: {
    card: "bg-[#D1FAE5]",
    icon: "trending-up",
    iconWrap: "bg-forest-500",
    label: "text-forest-700",
    value: "text-forest-900",
  },
  orange: {
    card: "bg-[#FED7AA]",
    icon: "trending-down",
    iconWrap: "bg-coral-500",
    label: "text-coral-700",
    value: "text-coral-700",
  },
  neutral: {
    card: "bg-white",
    icon: "wallet-outline",
    iconWrap: "bg-sky-500",
    label: "text-sky-500",
    value: "text-ink-900",
  },
};

export default function SummaryCard({
  label,
  value,
  accent,
}: SummaryCardProps) {
  return (
    <View
      className={`rounded-[24px] border border-sand-300 px-4 py-5 shadow-card ${accentMap[accent].card}`}
    >
      <View className="gap-5">
        <View className="flex-row items-center gap-3">
          <View
            className={`h-10 w-10 items-center justify-center rounded-full ${accentMap[accent].iconWrap}`}
          >
            <MaterialCommunityIcons
              name={accentMap[accent].icon}
              size={20}
              color="#ffffff"
            />
          </View>
          <Text className={`text-[15px] font-medium ${accentMap[accent].label}`}>
            {label}
          </Text>
        </View>

        <Text className={`text-[20px] font-semibold ${accentMap[accent].value}`}>
          {value}
        </Text>
      </View>
    </View>
  );
}
