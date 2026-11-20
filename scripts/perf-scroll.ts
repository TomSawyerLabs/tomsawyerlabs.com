// Measures how much work the browser does per frame while the home page fence
// shrinks into the top bar. Headless; run against a dev or preview server:
//   bun scripts/perf-scroll.ts [url] [light|dark]
// Reports frame times, plus layout/paint/raster time from a Chrome trace.
import { chromium } from "@playwright/test";

const url = process.argv[2] ?? "http://localhost:5173/";
const scheme = (process.argv[3] ?? "dark") as "light" | "dark";

const browser = await chromium.launch({
  args: ["--enable-gpu-rasterization", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({
  viewport: { width: 1600, height: 1000 },
  colorScheme: scheme,
});
await page.goto(url, { waitUntil: "load" });
await page.waitForTimeout(2000);

await browser.startTracing(page, {
  categories: ["devtools.timeline", "disabled-by-default-devtools.timeline"],
});

// Scroll down through the shrink and back up, one step per frame, recording
// each frame's duration.
const frames: number[] = await page.evaluate(
  () =>
    new Promise<number[]>((resolve) => {
      const range = window.innerHeight;
      const steps = 120;
      const out: number[] = [];
      let i = 0;
      let last = performance.now();
      const tick = (t: number) => {
        out.push(t - last);
        last = t;
        const k = i < steps ? i : 2 * steps - i;
        window.scrollTo(0, (k / steps) * range);
        if (++i <= 2 * steps) requestAnimationFrame(tick);
        else resolve(out.slice(2));
      };
      requestAnimationFrame(tick);
    }),
);

const trace = JSON.parse((await browser.stopTracing()).toString());
await browser.close();

const totals: Record<string, { ms: number; n: number }> = {};
for (const e of trace.traceEvents ?? []) {
  if (e.ph !== "X" || !e.dur) continue;
  const name =
    {
      Layout: "Layout",
      UpdateLayoutTree: "Recalc style",
      Paint: "Paint",
      RasterTask: "Raster",
      PrePaint: "Pre-paint",
      Layerize: "Layerize",
    }[e.name as string] ?? null;
  if (!name) continue;
  totals[name] ??= { ms: 0, n: 0 };
  totals[name].ms += e.dur / 1000;
  totals[name].n++;
}

frames.sort((a, b) => a - b);
const pct = (p: number) =>
  frames[Math.floor((frames.length - 1) * p)].toFixed(1);
console.log(`${scheme}: ${frames.length} frames`);
console.log(`  frame ms  p50 ${pct(0.5)}  p90 ${pct(0.9)}  max ${pct(1)}`);
for (const [k, v] of Object.entries(totals))
  console.log(`  ${k.padEnd(13)} ${v.ms.toFixed(1).padStart(8)} ms  (${v.n})`);
