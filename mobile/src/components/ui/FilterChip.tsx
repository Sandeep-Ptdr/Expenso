import { Pressable, Text } from "react-native";

type FilterChipProps = {
  label: string;
  selected?: boolean;
  tone?: "neutral" | "green" | "orange" | "blue" | "accent";
  onPress?: () => void;
};

const selectedClassName = {
  neutral: "border-ink-900 bg-ink-900",
  green: "border-forest-500 bg-forest-500",
  orange: "border-coral-500 bg-coral-500",
  blue: "border-sky-500 bg-sky-500",
  accent: "border-accent-700 bg-accent-700",
};

const unselectedTextClassName = {
  neutral: "text-ink-900",
  green: "text-forest-700",
  orange: "text-coral-700",
  blue: "text-sky-500",
  accent: "text-accent-700",
};

export default function FilterChip({
  label,
  selected = false,
  tone = "neutral",
  onPress,
}: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={
        selected
          ? `rounded-full border-2 px-4 py-2 ${selectedClassName[tone]}`
          : "rounded-full border-2 border-sand-300 bg-sand-50 px-4 py-2"
      }
    >
      <Text
        className={
          selected
            ? "text-sm font-medium text-white"
            : `text-sm font-medium ${unselectedTextClassName[tone]}`
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}
