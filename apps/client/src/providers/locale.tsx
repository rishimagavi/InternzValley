import "@/client/libs/dayjs";

import { i18n } from "@lingui/core";
import { detect, fromStorage, fromUrl } from "@lingui/detect-locale";
import { I18nProvider } from "@lingui/react";
import { languages } from "@reactive-resume/utils";
import { useEffect, useState } from "react";

import { defaultLocale, dynamicActivate } from "../libs/lingui";
import { updateUser } from "../services/user";
import { useAuthStore } from "../stores/auth";
import { logger } from "../libs/logger";
import { LoadingScreen } from "../components/loading-screen";

// Initialize with default messages
try {
  const { messages } = require(`../locales/${defaultLocale}/messages.js`);
  i18n.load(defaultLocale, messages);
  i18n.activate(defaultLocale);
} catch (error) {
  logger.error("Failed to load initial messages:", error);
  i18n.load(defaultLocale, {});
  i18n.activate(defaultLocale);
}

type Props = {
  children: React.ReactNode;
};

export const LocaleProvider = ({ children }: Props) => {
  const userLocale = useAuthStore((state) => state.user?.locale ?? defaultLocale);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // First try to detect locale from various sources
        const detectedLocale =
          detect(fromUrl("locale"), fromStorage("locale"), userLocale, defaultLocale) ?? defaultLocale;

        // Ensure the detected locale is supported
        const finalLocale = languages.some((lang) => lang.locale === detectedLocale)
          ? detectedLocale
          : defaultLocale;

        // Load translations
        await dynamicActivate(finalLocale);

        // Set default messages for fallback
        if (finalLocale !== defaultLocale) {
          try {
            const { messages } = await import(`../locales/${defaultLocale}/messages.js`);
            i18n.load(defaultLocale, messages);
          } catch (error) {
            logger.error("Failed to load default locale messages:", error);
          }
        }
      } catch (error) {
        logger.error("Failed to load translations:", error);
        setError("Failed to load translations. Using default language.");
        
        // As a last resort, try to load default locale
        try {
          await dynamicActivate(defaultLocale);
        } catch (fallbackError) {
          logger.error("Critical: Failed to load default locale:", fallbackError);
          setError("Critical: Failed to load any translations.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadTranslations();
  }, [userLocale]);

  if (isLoading || error) {
    return <LoadingScreen message={error} />;
  }

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
};

export const changeLanguage = async (locale: string) => {
  // Update locale in local storage
  window.localStorage.setItem("locale", locale);

  // Update locale in user profile, if authenticated
  const state = useAuthStore.getState();
  if (state.user) await updateUser({ locale }).catch(() => null);

  // Reload the page for language switch to take effect
  window.location.reload();
};
