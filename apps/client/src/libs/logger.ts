/* eslint-disable no-console */
export const logger = {
  info: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info(...args);
    }
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
  warn: (...args: unknown[]) => {
    console.warn(...args);
  },
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(...args);
    }
  }
}; 