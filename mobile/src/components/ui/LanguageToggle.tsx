import { View } from "react-native";

import { useI18n } from "@/hooks/use-i18n";
import PrimaryButton from "@/components/ui/PrimaryButton";

export default function LanguageToggle() {
  const { language, toggleLanguage, t } = useI18n();

  return (
    <View className="w-20">
      <PrimaryButton
        label={language === "en" ? t("language.hindi") : t("language.english")}
        variant="ghost"
        onPress={toggleLanguage}
      />
    </View>
  );
}
