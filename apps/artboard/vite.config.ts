/// <reference types='vitest' />

import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, searchForWorkspaceRoot } from "vite";

export default defineConfig({
  base: "/artboard/",

  cacheDir: "../../node_modules/.vite/artboard",

  build: {
    sourcemap: true,
    emptyOutDir: true,
  },

  server: {
    host: true,
    port: 6173,
    fs: { allow: [searchForWorkspaceRoot(process.cwd())] },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false
      }
    }
  },

  plugins: [
    react(),
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

  resolve: {
    alias: {
      "@/artboard/": `${searchForWorkspaceRoot(process.cwd())}/apps/artboard/src/`,
    },
  },
});
