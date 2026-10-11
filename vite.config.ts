import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Keep the original Host header so the API's same-origin check sees the address the browser used.
    proxy: { "/api": { target: "http://localhost:8787", changeOrigin: false, xfwd: true } },
  },
});
