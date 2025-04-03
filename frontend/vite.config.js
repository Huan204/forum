import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Hỗ trợ JSX trong tệp JS
      include: "**/*.{jsx,js,ts,tsx}",
    }),
  ],
  server: {
    port: 3001,
    strictPort: true,
    host: true,
    hmr: {
      overlay: true,
    },
    proxy: {
      "/api": {
        target: "http://localhost:5002",
        changeOrigin: true,
        secure: false,
      },
    },
    watch: {
      usePolling: true,
    },
  },
  css: {
    modules: {
      localsConvention: "camelCase",
      scopeBehaviour: "local",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
        ".jsx": "jsx",
      },
    },
    force: true,
  },
  define: {
    "process.env.VITE_API_URL": JSON.stringify("http://localhost:5002/api"),
    "process.env.VITE_API_URL_CATEGORIES": JSON.stringify(
      "http://localhost:5002/api/categories"
    ),
    "process.env.REACT_APP_API_URL": JSON.stringify(
      "http://localhost:5002/api"
    ),
  },
});
