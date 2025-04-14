/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  locales: ["en-US"],
  sourceLocale: "en-US",
  catalogs: [
    {
      path: "./src/locales/{locale}/messages",
      include: ["./src"],
    },
  ],
  format: "js",
  compileNamespace: "ts",
  orderBy: "messageId",
  pseudoLocale: "pseudo",
  fallbackLocales: {
    default: "en-US",
  },
  formatOptions: {
    lineNumbers: false,
    origins: false,
  },
}; 