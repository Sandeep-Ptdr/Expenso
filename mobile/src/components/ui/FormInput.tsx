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
      <Text className="text-sm font-semibold text-ink-900">{label}</Text>
      <TextInput
        placeholderTextColor="#8d877e"
        secureTextEntry={secureTextEntry}
        className="rounded-2xl border border-sand-300 bg-white px-4 py-4 text-base text-ink-900"
        {...props}
      />
      {error ? (
        <Text className="text-sm font-medium text-coral-500">{error}</Text>
      ) : null}
    </View>
  );
}
