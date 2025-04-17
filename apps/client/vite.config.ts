/// <reference types='vitest' />

import { lingui } from "@lingui/vite-plugin";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/client",

  build: {
    sourcemap: true,
    emptyOutDir: true,
    outDir: "dist",
    rollupOptions: {
      input: resolve(__dirname, "index.html")
    }
  },

  define: {
    appVersion: JSON.stringify(process.env.npm_package_version),
  },

  server: {
    host: true,
    port: 5173,
    fs: { allow: [searchForWorkspaceRoot(process.cwd())] },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false
      }
    }
  },

  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".po": "text",
      },
    },
  },

  plugins: [
    react({
      babel: {
        plugins: ["macros"],
      },
    }),
    lingui(),
    nxViteTsPaths(),
    {
      name: 'vite-plugin-locale-fallback',
      generateBundle(_, bundle) {
        // Create an empty fallback messages file if it doesn't exist
        if (!bundle['assets/locales/en-US/messages.js']) {
          this.emitFile({
            type: 'asset',
            fileName: 'assets/locales/en-US/messages.js',
            source: 'export const messages = {};'
          });
        }
      }
    }
  ],

  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },

  resolve: {
    alias: {
      "@/client/": `${searchForWorkspaceRoot(process.cwd())}/apps/client/src/`,
    },
  },
});
