import { Pressable, Text } from "react-native";

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: "solid" | "ghost";
  tone?: "dark" | "green" | "accent" | "orange" | "blue";
  disabled?: boolean;
};

const solidToneClassName = {
  dark: "bg-ink-900",
  green: "bg-forest-500",
  accent: "bg-accent-700",
  orange: "bg-coral-500",
  blue: "bg-sky-500",
};

const ghostToneClassName = {
  dark: "border-sand-300 bg-transparent text-ink-900",
  green: "border-forest-500/20 bg-forest-500/10 text-forest-700",
  accent: "border-accent-500/20 bg-accent-100 text-accent-700",
  orange: "border-coral-500/20 bg-coral-100 text-coral-700",
  blue: "border-sky-500/20 bg-sky-100 text-sky-500",
};

export default function PrimaryButton({
  label,
  onPress,
  variant = "solid",
  tone = "green",
  disabled = false,
}: PrimaryButtonProps) {
  const solid = variant === "solid";
  const ghostTextClassName = disabled
    ? "text-ink-700"
    : ghostToneClassName[tone].split(" ").slice(-1)[0];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      className={
        solid
          ? `min-h-[52px] items-center justify-center rounded-xl px-6 py-4 ${
              disabled ? "bg-ink-900/20" : solidToneClassName[tone]
            }`
          : `min-h-[52px] items-center justify-center rounded-xl border-2 px-6 py-4 ${
              disabled ? "border-sand-300 bg-sand-200" : ghostToneClassName[tone]
            }`
      }
      style={({ pressed }) => ({
        opacity: disabled ? 0.6 : pressed ? 0.92 : 1,
        transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
      })}
    >
      <Text
        className={
          solid
            ? "text-center text-base font-medium text-white"
            : `text-center text-base font-medium ${ghostTextClassName}`
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}
