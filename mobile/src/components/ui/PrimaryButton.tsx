import { Pressable, Text } from "react-native";

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: "solid" | "ghost";
  disabled?: boolean;
};

export default function PrimaryButton({
  label,
  onPress,
  variant = "solid",
  disabled = false,
}: PrimaryButtonProps) {
  const solid = variant === "solid";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      className={
        solid
          ? `rounded-2xl px-5 py-4 ${disabled ? "bg-forest-500/50" : "bg-forest-500"}`
          : `rounded-2xl border border-sand-300 px-5 py-4 ${disabled ? "bg-sand-200" : "bg-white"}`
      }
      style={({ pressed }) => ({
        opacity: pressed && !disabled ? 0.9 : 1,
      })}
    >
      <Text
        className={
          solid
            ? "text-center text-base font-semibold text-white"
            : "text-center text-base font-semibold text-ink-900"
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}
