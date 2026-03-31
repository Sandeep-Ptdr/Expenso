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
import { RegisterFormValues, registerSchema } from "@/validations/auth";

export default function RegisterScreen() {
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

      setServerError("Unable to create your account right now. Please try again.");
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
          <Text className="text-3xl font-bold leading-tight text-ink-900">
            Create your account
          </Text>
          <Text className="text-base leading-7 text-ink-700">
            Create your account and start tracking your full money picture from day
            one.
          </Text>
        </View>

        <Panel>
          <View className="gap-4">
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Full Name"
                  autoCapitalize="words"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Your full name"
                  error={errors.name?.message}
                />
              )}
            />

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
                  placeholder="Create a secure password"
                  error={errors.password?.message}
                />
              )}
            />

            {serverError ? (
              <Text className="text-sm font-medium text-coral-500">{serverError}</Text>
            ) : null}

            <PrimaryButton
              label={isSubmitting ? "Creating Account..." : "Create Account"}
              onPress={onSubmit}
              disabled={isSubmitting}
            />
          </View>
        </Panel>

        <Link href="/(auth)/login" asChild>
          <Text className="text-center text-base font-semibold text-forest-700">
            Already have an account? Sign in
          </Text>
        </Link>
      </ScrollView>
    </Screen>
  );
}
