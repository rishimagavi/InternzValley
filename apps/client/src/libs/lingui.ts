import { i18n } from "@lingui/core";
import { t } from "@lingui/macro";
import dayjs from "dayjs";

import { dayjsLocales } from "./dayjs";
import { logger } from "./logger";

export const defaultLocale = "en-US";

// Initialize with empty messages
i18n.load(defaultLocale, {});
i18n.activate(defaultLocale);

export async function dynamicActivate(locale: string) {
  try {
    // If requesting default locale and it's already loaded, skip
    if (locale === defaultLocale && i18n.locale === defaultLocale && Object.keys(i18n.messages).length > 0) {
      return;
    }

    // Try to load messages synchronously first for the default locale
    if (locale === defaultLocale) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { messages } = require(`../locales/${locale}/messages.js`);
        if (messages && typeof messages === "object") {
          i18n.load(locale, messages);
          i18n.activate(locale);
          return;
        }
      } catch (error) {
        logger.warn(t`Failed to load messages synchronously, trying async...`);
      }
    }

    // Load messages asynchronously
    const { messages } = await import(`../locales/${locale}/messages.js`);

    if (!messages || typeof messages !== "object") {
      throw new Error(t`Invalid messages found for locale: ${locale}`);
    }

    i18n.load(locale, messages);
    i18n.activate(locale);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (dayjsLocales[locale]) {
      dayjs.locale(await dayjsLocales[locale]());
    }
  } catch (error) {
    logger.error(t`Failed to load messages for locale: ${locale}`, error);
    
    // If default locale fails, this is critical
    if (locale === defaultLocale) {
      throw new Error(t`Critical: Failed to load default locale (${defaultLocale})`);
    }
    
    // Try loading default locale as fallback
    logger.warn(t`Falling back to default locale (${defaultLocale})`);
    return dynamicActivate(defaultLocale);
  }
}
