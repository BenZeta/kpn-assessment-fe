import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "../assessment_be/dist/public/build",
    emptyOutDir: true,
  },
  ssr: {
    optimizeDeps: {
      include: ["html-react-parser"],
    },
  },
});
