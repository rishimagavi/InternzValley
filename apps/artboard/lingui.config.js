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
}; 