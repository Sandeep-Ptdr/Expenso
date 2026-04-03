import { Text, TextInput, TextInputProps, View } from "react-native";

type FormInputProps = TextInputProps & {
  label: string;
  error?: string;
};

export default function FormInput({
  label,
  error,
  secureTextEntry,
  ...props
}: FormInputProps) {
  return (
    <View className="gap-2">
      {label ? <Text className="text-sm font-medium text-ink-900">{label}</Text> : null}
      <TextInput
        placeholderTextColor="#9ca3af"
        secureTextEntry={secureTextEntry}
        className="min-h-[52px] rounded-xl border border-sand-300 bg-sand-200 px-4 py-3 text-base text-ink-900"
        {...props}
      />
      {error ? (
        <Text className="text-sm font-medium text-coral-500">{error}</Text>
      ) : null}
    </View>
  );
}
