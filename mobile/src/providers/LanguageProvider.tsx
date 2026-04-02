import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from "react";

import { Language, TranslationKey, translations } from "@/i18n/translations";
import { storage } from "@/lib/storage";

const LANGUAGE_STORAGE_KEY = "expense-manager-language";

type Params = Record<string, string | number>;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  toggleLanguage: () => Promise<void>;
  t: (key: TranslationKey, params?: Params) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const interpolate = (template: string, params?: Params) => {
  if (!params) {
    return template;
  }

  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replaceAll(`{${key}}`, String(value));
  }, template);
};

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    let mounted = true;

    const loadLanguage = async () => {
      const storedLanguage = await storage.getItem(LANGUAGE_STORAGE_KEY);

      if (!mounted) {
        return;
      }

      if (storedLanguage === "en" || storedLanguage === "hi") {
        setLanguageState(storedLanguage);
      }
    };

    loadLanguage();

    return () => {
      mounted = false;
    };
  }, []);

  const setLanguage = async (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    await storage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  };

  const toggleLanguage = async () => {
    await setLanguage(language === "en" ? "hi" : "en");
  };

  const value = useMemo<LanguageContextValue>(() => {
    return {
      language,
      setLanguage,
      toggleLanguage,
      t: (key, params) => interpolate(translations[language][key], params),
      formatCurrency: (amount) => {
        const formattedAmount = new Intl.NumberFormat(language === "hi" ? "hi-IN" : "en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);

        return interpolate(translations[language]["common.currency"], {
          amount: formattedAmount,
        });
      },
      formatDate: (date) =>
        new Date(date).toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useI18n must be used within LanguageProvider.");
  }

  return context;
}
