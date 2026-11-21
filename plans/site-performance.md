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

## Progress log

- [x] Measure sizes, paint timing and caching
- [ ] Decide which of the candidates to do (waiting on Cameron)

## Open questions for the user

1. Which candidates to do? Recommendation: 1–3 now (small, no trade-offs), 4 as
   its own decision, 5 only after a trace.

## Things not to do

- Don't change Cloudflare dashboard settings for caching; `_headers` in the
  repo covers it.
