/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  locales: ["en-US"],
  sourceLocale: "en-US",
  catalogs: [
    {
      path: "src/locales/{locale}/messages",
      include: ["src"],
    },
  ],
  format: "po",
  formatOptions: {
    lineNumbers: false,
  },
  orderBy: "messageId",
  compileNamespace: "ts",
  runtimeConfigModule: ["@lingui/core", "i18n"],
}; 