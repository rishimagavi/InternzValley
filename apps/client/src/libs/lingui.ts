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
    // If requesting default locale and it's already loaded, verify messages exist
    if (locale === defaultLocale && i18n.locale === defaultLocale) {
      if (i18n.messages && Object.keys(i18n.messages).length > 0) {
        return;
      }
      logger.warn("Default locale active but no messages found, reloading...");
    }

    let messages;

    // Try to load messages synchronously first for the default locale
    if (locale === defaultLocale) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const result = require(`../locales/${locale}/messages.js`);
        if (result.messages && typeof result.messages === "object") {
          messages = result.messages;
        } else {
          throw new Error("Invalid messages format in synchronous load");
        }
      } catch (error) {
        logger.warn(t`Failed to load messages synchronously, trying async...`);
      }
    }

    // If synchronous load failed or it's not the default locale, try async
    if (!messages) {
      const result = await import(`../locales/${locale}/messages.js`);
      if (!result.messages || typeof result.messages !== "object") {
        throw new Error(t`Invalid messages found for locale: ${locale}`);
      }
      messages = result.messages;
    }

    // Load and activate the messages
    i18n.load(locale, messages);
    i18n.activate(locale);

    // Set up dayjs locale if available
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (dayjsLocales[locale]) {
      try {
        dayjs.locale(await dayjsLocales[locale]());
      } catch (error) {
        logger.error(t`Failed to load dayjs locale for: ${locale}`, error);
      }
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
