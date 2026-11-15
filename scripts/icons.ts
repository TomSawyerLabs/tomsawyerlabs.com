// Renders the PNG icons and the social card from their SVG sources with
// Playwright's Chromium (so the card's text uses the site's own font).
// Run `bun run icons` after editing assets/og.svg, and commit the PNG it
// writes to public/. (The favicons are the .ico files already in public/.)

import { chromium } from "@playwright/test";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

const outputs: {
  source: string;
  out: string;
  width: number;
  height: number;
  /** iOS rounds the corners itself and fills transparency with black. */
  square?: boolean;
}[] = [{ source: "assets/og.svg", out: "og.png", width: 1200, height: 630 }];

const browser = await chromium.launch();
try {
  for (const { source, out, width, height, square } of outputs) {
    const page = await browser.newPage({
      viewport: { width, height },
      colorScheme: "light",
    });
    await page.goto(pathToFileURL(join(root, source)).href);
    if (square) {
      await page.evaluate(() => {
        const style = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "style",
        );
        style.textContent = "#bg { rx: 0; }";
        document.documentElement.append(style);
      });
    }
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: join(root, "public", out),
      omitBackground: !square,
    });
    await page.close();
    console.log(`public/${out} (${width}×${height}) from ${source}`);
  }
} finally {
  await browser.close();
}
