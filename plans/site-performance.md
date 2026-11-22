# Site performance and load times

## Goal

Make tomsawyerlabs.com (the `fence-site` branch) load and paint faster, mainly
the home page, whose hero is the fence.

## Environment / context

- Worktree: `C:\Users\camer\.t3\worktrees\tomsawyerlabs.com\fence-site`, branch `fence-site`.
- Hosting: Cloudflare Workers static assets (`wrangler.jsonc`), no Worker script.
  Every page is prerendered HTML in `build/client`, hydrated by React Router.
- Measurements below: production build, headless Chromium 1920×1080, 4× CPU
  throttle, local static server (no network delay), 3–5 runs each. Measured
  2026-11-21.

## Decisions already made (don't re-ask)

- Keep React hydration and client-side page changes (Cameron, 2026-11-21:
  "I like hydration and fast page changes"). Item 4 is dropped.

## Findings (measured)

### Transfer sizes, home page (Brotli)

- `index.html` 186 KB raw, 26 KB br (72 KB gzip). The 52 KB logo SVG is inlined
  three times (halo, logo, bar mark). Gzip's 32 KB window can't dedupe repeats
  that far apart; Brotli mostly does.
- JS about 130 KB br: `entry.client` 60, `jsx-runtime` (React) 35, `Fence` 21
  (holds a fourth copy of the logo markup), `site` 13, others small.
- CSS 8 KB br. Fonts used on first paint: Inter latin 48 KB, Permanent Marker
  30 KB, JetBrains Mono latin 40 KB.

### Paint

- FCP about 150–200 ms, LCP about 1.0–1.2 s. The LCP element is
  `.fence__tagline`, which waits on the Permanent Marker font. The font isn't
  preloaded, so it's only found after CSS is parsed and the page laid out.
- About 200–450 ms of long tasks remain **with JavaScript blocked**, so it's
  rendering, not hydration. It's spread out: removing the picket noise
  textures, the logo filters or the inline logos each moved it only within run
  noise; hiding the pickets entirely saved about 100 ms median.

### Caching (live site, checked with curl)

- Every response, including the content-hashed `/assets/*` files, is served
  with `Cache-Control: public, max-age=0, must-revalidate`, so a repeat visit
  revalidates every script, stylesheet and font.

## Candidate improvements (ranked by payoff ÷ effort)

1. **Long-lived cache on `/assets/*`**: add `public/_headers` with
   `/assets/*` → `Cache-Control: public, max-age=31536000, immutable`. Repeat
   visits then load nothing but the HTML. Small, site-repo-only change.
2. **Preload the hero fonts**: Permanent Marker latin woff2 (the LCP
   element's font) and Inter latin, via the root `links` export. Should pull LCP
   toward FCP.
3. **Logo once, not three or four times**: inline it once as a `<symbol>` and
   draw the others with `<use>`; shrink the path data with svgo (lower
   precision); keep the markup out of the JS bundle. Cuts about 120 KB raw from
   the HTML and about 20 KB br from JS.
4. **Ship far less JavaScript** (bigger change, needs a decision): the site is
   static and the fence already works on CSS alone. The only client behaviour
   left is the background glow's mouse tracking and the Firefox fence fallback,
   both of which a few-KB vanilla script could do. Dropping hydration removes
   about 130 KB br and the hydration work. Cost: client-side navigation between
   pages becomes full page loads (fast here, since every page is prerendered).
5. **Cheaper picket rendering**: pre-render the noise textures to small
   images, or reduce what each picket paints. Worth about 100 ms of main-thread
   time at 4× throttle; needs a trace to confirm before doing.

## Results (2026-11-21)

- Item 1 done (`7c4b622`): `public/_headers` gives `/assets/*` a year,
  immutable.
- Item 2 done (`0e8584b`): Permanent Marker and Inter latin preloaded. With no
  network delay, the preload makes first paint wait for the fonts (FCP = LCP,
  about 1 s, at 4x CPU), with LCP unchanged. On throttled Slow 4G (150 ms,
  1.6 Mbps) median LCP is 2.09 s with the preload vs 2.32 s without, and
  steadier. Kept.
- Item 3 done in the site (`49bcb55`): one `<symbol>` in the root layout,
  `<use>` everywhere, path data server-rendered only. Home HTML 186 → 82 KB raw,
  Fence chunk 55 → 2.6 KB, all JS 130 → 117 KB br. The svgo part belongs in
  the ui repo (ISSUES.md).

## Progress log

- [x] Measure sizes, paint timing and caching
- [x] 1. Cache headers
- [x] 2. Font preloads
- [x] 3. Logo once (site side; svgo in ui is logged in ISSUES.md)
- [x] Live check after deploy (`e80eaae`, 2026-11-21): assets immutable, HTML 82 KB, one symbol + 3 uses, 2 preloads
- [x] 4. Drop hydration: dropped, see Decisions
- [x] 5. First-paint trace (go-ahead 2026-11-22). Script: scratchpad
      `firstpaint.mjs` (static server on :4817 over `build/client`, Chrome
      trace, 4x CPU, CSS-override variants)
- [ ] 5a/5b. Waiting on Cameron's go-ahead

## First-paint trace (2026-11-22)

JS off, 4x CPU, 1920×1080, medians of 5–9 interleaved runs. The machine was
loaded (Defender, a rustc build, the :5181 dev server), so absolute times are
inflated; compare variants, not absolutes.

- The first-paint long task is mostly **Layout** (about 1.7 s of 3–4 s main
  busy), not paint. Inside the first Layout: `performLayout` self about 630 ms,
  `InlineNode::ShapeTextIncludingFirstLine` about 480 ms over 189 calls,
  woff2 decode about 70 ms.
- Hiding `<main>` (everything below the fence): Layout 1.75 s → 0.67 s.
- Everything in Arial: Layout → about 1.0–1.2 s (text shaping is real cost).
- Pickets: Layout unchanged; PaintImage (the noise SVGs) 230 → 7 ms, main
  busy down about 1 s, but noisy. The picket paint is real but secondary.
- `content-visibility: auto` on sections/categories: Layout 1.75 → 1.2–1.6 s.
  Weak, likely because the intro and feature sit inside its viewport margin.
- No single effect (logo filters, halo, tagline shadow, page noise, glow,
  will-change, clip-path, wash) moved anything beyond noise.
- Bisecting `<main>`: no hotspot. Cards about 30% of its layout, its web
  fonts about 20%, intro/feature/sketch each within noise. It's ordinary
  first-layout cost for that much text with cold font caches.
- **JS on, LCP, 9 runs each** (ranges don't overlap):
  - base: median 1.97 s (1.78–2.54)
  - picket noise off: 1.64 s (1.48–1.92)
  - `content-visibility: auto` on `main > .section, .category`: 1.68 s
    (1.40–1.89)
  - both: **1.20 s** (1.13–1.57), about 40% faster.

### Proposed (item 5, from the trace)

- 5a. `content-visibility: auto; contain-intrinsic-size: auto 600px` on the
  home page's sections and categories. No visual change. Check `/#projects`
  lands right and find-in-page works.
- 5b. Bake the picket grain/streak noise (SVG `feTurbulence`, re-run per
  picket on first paint) into small pre-rendered images with the same look,
  compared by screenshot. Costs some bytes; the noise-off test is the upper
  bound on the gain.

## Findings / gotchas

- A `<use>` of a `<symbol>` must not repeat the symbol's viewBox offset on its
  own `<svg>`: the offset is applied twice and the logo draws 1150 units low,
  mostly clipped. Caught by screenshot, not by `getBBox()` (which still reported
  the full width). The client-nav test now checks the drawn box stays inside.
- Firefox sometimes reports `use.getBoundingClientRect()` without the symbol's
  viewBox offset even though it draws correctly, so that check skips Firefox.
- Clicking a card before hydration does a full page load; tests that need
  client-side navigation wait for React's `__reactFiber` key on the link.

## Open questions for the user

1. Do 5a (`content-visibility`) and 5b (pre-rendered picket noise)?
   Together they take LCP from 1.97 to 1.20 s at 4x CPU. Recommendation: both;
   5b only if the screenshots match.

## Things not to do

- Don't change Cloudflare dashboard settings for caching; `_headers` in the
  repo covers it.
