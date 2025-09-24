import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const srcPath = path.resolve(__dirname, "src");
const clientRoot = path.resolve(__dirname, "src/client");

export default defineConfig({
  root: clientRoot,
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, "dist/client"),
    emptyOutDir: true
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4000"
    },
    fs: {
      allow: [srcPath]
    }
  },
  preview: {
    port: 4173
  },
  test: {
    root: __dirname,
    environment: "jsdom",
    setupFiles: path.resolve(__dirname, "tests/vitest.setup.ts"),
    globals: true
  }
});
