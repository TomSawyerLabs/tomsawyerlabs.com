import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import { reviewServer } from "./review/plugin.ts";

export default defineConfig({
  plugins: [reactRouter(), reviewServer()],
  // @tomsawyerlabs/ui ships TypeScript source, so the prerender (SSR) build
  // has to bundle and compile it rather than import it from node_modules.
  ssr: { noExternal: ["@tomsawyerlabs/ui"] },
  // The "~/*" alias in tsconfig.json (the build resolves it without this; the
  // dev server doesn't).
  resolve: { tsconfigPaths: true },
  // The dev server doubles as the review server for people on our LANs:
  // listen on every interface, IPv4 and IPv6 (`true` binds "::", which is
  // dual-stack), and answer to any host name, not just an IP. Requests from
  // outside our networks (e.g. via the public IPv6 address) are refused in
  // review/plugin.ts.
  server: {
    host: true,
    allowedHosts: true,
  },
});
