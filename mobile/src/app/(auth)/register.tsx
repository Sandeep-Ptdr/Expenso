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
import { RegisterFormValues, registerSchema } from "@/validations/auth";

export default function RegisterScreen() {
  const { t } = useI18n();
  const { register, isAuthenticated, isSubmitting } = useAuth();
  const [serverError, setServerError] = useState("");
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setServerError("");
      await register({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        return;
      }

      setServerError(t("auth.registerError"));
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
          <Text className="text-3xl font-bold leading-tight text-ink-900">
            {t("auth.registerTitle")}
          </Text>
          <Text className="text-base leading-7 text-ink-700">
            {t("auth.registerSubtitle")}
          </Text>
        </View>

        <Panel>
          <View className="gap-4">
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label={t("auth.fullName")}
                  autoCapitalize="words"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder={t("auth.fullNamePlaceholder")}
                  error={errors.name?.message}
                />
              )}
            />

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
                  placeholder={t("auth.passwordCreatePlaceholder")}
                  error={errors.password?.message}
                />
              )}
            />

            {serverError ? (
              <Text className="text-sm font-medium text-coral-500">{serverError}</Text>
            ) : null}

            <PrimaryButton
              label={
                isSubmitting ? t("auth.creatingAccount") : t("auth.createAccount")
              }
              onPress={onSubmit}
              disabled={isSubmitting}
            />
          </View>
        </Panel>

        <Link href="/(auth)/login" asChild>
          <Text className="text-center text-base font-semibold text-forest-700">
            {t("auth.haveAccount")}
          </Text>
        </Link>
      </ScrollView>
    </Screen>
  );
}
