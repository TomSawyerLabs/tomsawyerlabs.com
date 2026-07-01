import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter()],
  // @tomsawyerlabs/ui ships TypeScript source, so it must be transpiled (not
  // externalized) during the SSG prerender's server build, not just the client.
  ssr: {
    noExternal: ["@tomsawyerlabs/ui"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["noook", "noook.tsl"],
  },
});
