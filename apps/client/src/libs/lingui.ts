import { i18n } from "@lingui/core";
import dayjs from "dayjs";

import { dayjsLocales } from "./dayjs";

export const defaultLocale = "en-US";

export async function dynamicActivate(locale: string) {
  try {
    const { messages } = await import(`../locales/${locale}/messages.po`);

    if (!messages) {
      throw new Error(`No messages found for locale: ${locale}`);
    }

    i18n.load(locale, messages);
    i18n.activate(locale);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (dayjsLocales[locale]) {
      dayjs.locale(await dayjsLocales[locale]());
    }
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    
    // If default locale fails, throw error
    if (locale === defaultLocale) {
      throw error;
    }
    
    // Try loading default locale as fallback
    return dynamicActivate(defaultLocale);
  }
}
