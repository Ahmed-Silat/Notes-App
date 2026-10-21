import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// React, React DOM (including react-dom/client) and the router, by folder
const REACT_PACKAGES =
  /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // React and the router in a file of their own: it changes only when
        // they're upgraded, so browsers keep it cached across deploys, and it
        // downloads alongside the app's own code.
        manualChunks: (id) => {
          if (REACT_PACKAGES.test(id)) return "react";
        },
      },
    },
  },
});
