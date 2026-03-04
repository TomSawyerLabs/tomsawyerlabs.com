import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  async prerender() {
    return ["/", "/404"];
  },
} satisfies Config;
