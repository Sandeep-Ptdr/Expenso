import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Redirect } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import FormInput from "@/components/ui/FormInput";
import Panel from "@/components/ui/Panel";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Screen from "@/components/ui/Screen";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { ApiError } from "@/services/api/http";
import { LoginFormValues, loginSchema } from "@/validations/auth";

export default function LoginScreen() {
  const { t } = useI18n();
  const { login, isAuthenticated, isSubmitting } = useAuth();
  const [serverError, setServerError] = useState("");
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setServerError("");
      await login({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        return;
      }

      setServerError(t("auth.loginError"));
    }
  });

  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <Screen padded={false}>
      <ScrollView
        className="flex-1 bg-sand-100"
        contentContainerClassName="flex-grow justify-center gap-6 px-5 py-4"
      >
        <View className="items-end">
          <LanguageToggle />
        </View>
        <View className="gap-3">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-forest-700">
            {t("auth.appName")}
          </Text>
          <Text className="text-4xl font-bold leading-tight text-ink-900">
            {t("auth.loginTitle")}
          </Text>
          <Text className="text-base leading-7 text-ink-700">
            {t("auth.loginSubtitle")}
          </Text>
        </View>

        <Panel>
          <View className="gap-4">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label={t("auth.email")}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder={t("auth.emailPlaceholder")}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label={t("auth.password")}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder={t("auth.passwordPlaceholder")}
                  error={errors.password?.message}
                />
              )}
            />

            {serverError ? (
              <Text className="text-sm font-medium text-coral-500">{serverError}</Text>
            ) : null}

            <PrimaryButton
              label={isSubmitting ? t("auth.signingIn") : t("auth.signIn")}
              onPress={onSubmit}
              disabled={isSubmitting}
            />
          </View>
        </Panel>

        <Link href="/(auth)/register" asChild>
          <Text className="text-center text-base font-semibold text-forest-700">
            {t("auth.needAccount")}
          </Text>
        </Link>
      </ScrollView>
    </Screen>
  );
}
