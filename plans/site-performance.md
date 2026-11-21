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
- [ ] 4. Drop hydration: waiting on Cameron's call
- [ ] 5. Picket rendering: needs a trace first

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

1. Item 4 (drop React hydration, about 115 KB br of JS): worth doing? Costs
   client-side navigation.

## Things not to do

- Don't change Cloudflare dashboard settings for caching; `_headers` in the
  repo covers it.
