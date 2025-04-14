import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Outlet } from "react-router";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { defaultLocale } from "../constants/locale";

import { helmetContext } from "../constants/helmet";
import { useArtboardStore } from "../store/artboard";

// Load default messages immediately
const loadDefaultMessages = async () => {
  try {
    const { messages: defaultMessages } = await import(`../locales/${defaultLocale}/messages.js`);
    i18n.load(defaultLocale, defaultMessages);
    i18n.activate(defaultLocale);
  } catch (error: unknown) {
    console.error("Failed to load artboard messages:", error);
  }
};

void loadDefaultMessages();

export const Providers = () => {
  const resume = useArtboardStore((state) => state.resume);
  const setResume = useArtboardStore((state) => state.setResume);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data.type === "SET_RESUME") setResume(event.data.payload);
    };

    window.addEventListener("message", handleMessage, false);

    return () => {
      window.removeEventListener("message", handleMessage, false);
    };
  }, []);

  useEffect(() => {
    const resumeData = window.localStorage.getItem("resume");

    if (resumeData) setResume(JSON.parse(resumeData));
  }, [window.localStorage.getItem("resume")]);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!resume) return null;

  return (
    <I18nProvider i18n={i18n}>
      <HelmetProvider context={helmetContext}>
        <Outlet />
      </HelmetProvider>
    </I18nProvider>
  );
};
