import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Only REACT_APP_* reaches the browser. An empty prefix here loads EVERY
  // variable of the machine that builds (HOME, PATH, and any API key or token
  // exported in that shell) and writes them all into the published bundle.
  const env = loadEnv(mode, process.cwd(), "REACT_APP_");
  return {
    plugins: [react()],
    define: {
      "process.env": { ...env, NODE_ENV: mode },
    },
  };
});
