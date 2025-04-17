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

// Load default messages immediately
const loadDefaultMessages = async () => {
  try {
    // First try direct import
    let defaultMessages;
    try {
      const imported = await import(`../locales/${defaultLocale}/messages.js`);
      defaultMessages = imported.messages;
    } catch (importError) {
      // Fallback to empty messages if import fails
      defaultMessages = {};
      logger.warn(t`Using empty messages for default locale due to import error`);
    }
    
    i18n.load(defaultLocale, defaultMessages);
    i18n.activate(defaultLocale);
  } catch (error: unknown) {
    logger.error(t`Failed to load default messages:`, error);
    // Fallback to empty messages
    i18n.load(defaultLocale, {});
    i18n.activate(defaultLocale);
  }
};

void loadDefaultMessages();

type Props = {
  children: React.ReactNode;
};

export const LocaleProvider = ({ children }: Props) => {
  const userLocale = useAuthStore((state) => state.user?.locale ?? defaultLocale);
  const [isLoading, setIsLoading] = useState(userLocale !== defaultLocale);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTranslations = async () => {
      // If using default locale, no need to load additional translations
      if (userLocale === defaultLocale) return;

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

        // If we've fallen back to default locale, no need to load additional translations
        if (finalLocale === defaultLocale) {
          setIsLoading(false);
          return;
        }

        // Load translations for the detected locale
        try {
          let messages;
          try {
            const imported = await import(`../locales/${finalLocale}/messages.js`);
            messages = imported.messages;
            if (!messages) throw new Error(t`No messages found`);
          } catch (importError) {
            logger.warn(t`Fallback to default locale due to import error for: ${finalLocale}`);
            i18n.activate(defaultLocale);
            setIsLoading(false);
            return;
          }
          
          i18n.load(finalLocale, messages);
          i18n.activate(finalLocale);
        } catch (error: unknown) {
          logger.error(t`Failed to load translations:`, error);
          // Fallback to default locale (which is already loaded)
          i18n.activate(defaultLocale);
        }
      } catch (error: unknown) {
        logger.error(t`Critical: Failed to load translations:`, error);
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
