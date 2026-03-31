import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Redirect } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import FormInput from "@/components/ui/FormInput";
import Panel from "@/components/ui/Panel";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Screen from "@/components/ui/Screen";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/services/api/http";
import { LoginFormValues, loginSchema } from "@/validations/auth";

export default function LoginScreen() {
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

      setServerError("Unable to sign in right now. Please try again.");
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
        <View className="gap-3">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-forest-700">
            Expense Manager
          </Text>
          <Text className="text-4xl font-bold leading-tight text-ink-900">
            Money clarity, built for everyday life.
          </Text>
          <Text className="text-base leading-7 text-ink-700">
            Sign in to manage income, expenses, and transfers from one calm,
            mobile-first workspace.
          </Text>
        </View>

        <Panel>
          <View className="gap-4">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Email"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="you@example.com"
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Enter your password"
                  error={errors.password?.message}
                />
              )}
            />

            {serverError ? (
              <Text className="text-sm font-medium text-coral-500">{serverError}</Text>
            ) : null}

            <PrimaryButton
              label={isSubmitting ? "Signing In..." : "Sign In"}
              onPress={onSubmit}
              disabled={isSubmitting}
            />
          </View>
        </Panel>

        <Link href="/(auth)/register" asChild>
          <Text className="text-center text-base font-semibold text-forest-700">
            Need an account? Create one
          </Text>
        </Link>
      </ScrollView>
    </Screen>
  );
}
