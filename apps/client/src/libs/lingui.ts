import { i18n } from "@lingui/core";
import { t } from "@lingui/macro";
import dayjs from "dayjs";

import { messages as defaultMessages } from "../locales/en-US/messages.po";
import { dayjsLocales } from "./dayjs";
import { logger } from "./logger";

export const defaultLocale = "en-US";

// Initialize i18n with default messages
i18n.load(defaultLocale, defaultMessages);
i18n.activate(defaultLocale);

export async function dynamicActivate(locale: string) {
  try {
    // If requesting default locale and it's already loaded, skip
    if (locale === defaultLocale && i18n.locale === defaultLocale) {
      return;
    }

    const { messages } = await import(`../locales/${locale}/messages.po`);

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
    logger.error(`Failed to load messages for locale: ${locale}`, error);
    
    // If default locale fails, this is critical
    if (locale === defaultLocale) {
      throw new Error(t`Critical: Failed to load default locale (${defaultLocale})`);
    }
    
    // Try loading default locale as fallback
    logger.warn(t`Falling back to default locale (${defaultLocale})`);
    return dynamicActivate(defaultLocale);
  }
}
