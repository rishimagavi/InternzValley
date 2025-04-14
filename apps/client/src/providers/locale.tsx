import "@/client/libs/dayjs";

import { i18n } from "@lingui/core";
import { detect, fromStorage, fromUrl } from "@lingui/detect-locale";
import { I18nProvider, Trans } from "@lingui/react";
import { languages } from "@reactive-resume/utils";
import { useEffect, useState } from "react";

import { defaultLocale, dynamicActivate } from "../libs/lingui";
import { updateUser } from "../services/user";
import { useAuthStore } from "../stores/auth";
import { logger } from "../libs/logger";

type Props = {
  children: React.ReactNode;
};

export const LocaleProvider = ({ children }: Props) => {
  const userLocale = useAuthStore((state) => state.user?.locale ?? defaultLocale);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setIsLoading(true);
        
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
            const { messages: defaultMessages } = await import(`../locales/${defaultLocale}/messages.po`);
            i18n.load(defaultLocale, defaultMessages);
          } catch (error) {
            logger.error("Failed to load default locale messages:", error);
          }
        }
      } catch (error) {
        logger.error("Failed to load translations:", error);
        
        // As a last resort, try to load default locale
        try {
          await dynamicActivate(defaultLocale);
        } catch (fallbackError) {
          logger.error("Critical: Failed to load default locale:", fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadTranslations();
  }, [userLocale]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-2 text-2xl font-bold">
            <Trans>Loading...</Trans>
          </div>
          <div className="text-sm opacity-75">
            <Trans>Please wait while we load your preferred language.</Trans>
          </div>
        </div>
      </div>
    );
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
