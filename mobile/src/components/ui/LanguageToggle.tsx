import { Pressable, Text, View } from "react-native";

import { useI18n } from "@/hooks/use-i18n";

export default function LanguageToggle() {
  const { language, setLanguage } = useI18n();

  return (
    <View className="flex-row rounded-full border border-sand-300 bg-white p-1 shadow-card">
      {[
        { key: "en", label: "English" },
        { key: "hi", label: "हिंदी" },
      ].map((item) => {
        const active = language === item.key;

        return (
          <Pressable
            key={item.key}
            onPress={() => setLanguage(item.key as "en" | "hi")}
            className={`rounded-full px-4 py-2 ${active ? "bg-ink-900" : "bg-transparent"}`}
          >
            <Text
              className={`text-sm font-medium ${active ? "text-white" : "text-ink-700"}`}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
