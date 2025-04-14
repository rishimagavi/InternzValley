import "@/client/libs/dayjs";

import { i18n } from "@lingui/core";
import { detect, fromStorage, fromUrl } from "@lingui/detect-locale";
import { t } from "@lingui/macro";
import { I18nProvider } from "@lingui/react";
import { languages } from "@reactive-resume/utils";
import { useEffect, useState } from "react";

import { LoadingScreen } from "../components/loading-screen";
import { defaultLocale } from "../libs/lingui";
import { logger } from "../libs/logger";
import { updateUser } from "../services/user";
import { useAuthStore } from "../stores/auth";

// Initialize i18n instance immediately
i18n.load(defaultLocale, {});
i18n.activate(defaultLocale);

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

        // Detect locale from various sources
        const detectedLocale =
          detect(fromUrl("locale"), fromStorage("locale"), userLocale, defaultLocale) ?? defaultLocale;

        // Ensure detected locale is supported
        const finalLocale = languages.some((lang) => lang.locale === detectedLocale)
          ? detectedLocale
          : defaultLocale;

        // Load translations
        try {
          const { messages } = await import(`../locales/${finalLocale}/messages.js`);
          if (!messages) throw new Error(t`No messages found`);
          
          i18n.load(finalLocale, messages);
          i18n.activate(finalLocale);

          // Load default locale messages for fallback if not already loaded
          if (finalLocale !== defaultLocale) {
            const { messages: defaultMessages } = await import(`../locales/${defaultLocale}/messages.js`);
            if (defaultMessages) {
              i18n.load(defaultLocale, defaultMessages);
            }
          }
        } catch (error) {
          logger.error(t`Failed to load translations:`, error);
          
          // Try loading default locale as fallback
          const { messages: defaultMessages } = await import(`../locales/${defaultLocale}/messages.js`);
          if (!defaultMessages) throw new Error(t`Failed to load default messages`);
          
          i18n.load(defaultLocale, defaultMessages);
          i18n.activate(defaultLocale);
        }
      } catch (error) {
        logger.error(t`Critical: Failed to load any translations:`, error);
        setError(t`Failed to load translations. Please try refreshing the page.`);
      } finally {
        setIsLoading(false);
      }
    };

    void loadTranslations();
  }, [userLocale]);

  if (isLoading) {
    return <LoadingScreen message={t`Loading translations...`} />;
  }

  if (error) {
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
