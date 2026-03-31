import { Pressable, Text } from "react-native";

type FilterChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export default function FilterChip({
  label,
  selected = false,
  onPress,
}: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={
        selected
          ? "rounded-full bg-forest-500 px-4 py-2"
          : "rounded-full border border-sand-300 bg-white px-4 py-2"
      }
    >
      <Text
        className={
          selected
            ? "text-sm font-semibold text-white"
            : "text-sm font-semibold text-ink-900"
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}
