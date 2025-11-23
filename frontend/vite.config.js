import { defineConfig } from "vite";
import path from "path";

export default defineConfig({

  build: {

    rollupOptions: {
      input: {
        atoms: path.resolve(__dirname, "./src/pages/atoms.html"),
        dashboard: path.resolve(__dirname, "./src/pages/dashboard.html"),
        login: path.resolve(__dirname, "./src/pages/login.html"),
        signals: path.resolve(__dirname, "./src/pages/signals.html"),
        interactions: path.resolve(__dirname, "./src/pages/interactions.html"),
      },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "~components": path.resolve(__dirname, "./src/components"),
      "~js": path.resolve(__dirname, "./src/js"),
      "~pages": path.resolve(__dirname, "./src/pages"),
      "~styles": path.resolve(__dirname, "./src/styles"),
      "~fonts": path.resolve(__dirname, "./src/fonts"),
    },
  },

  server: {
    open: '/src/pages/login.html'
  }

});
