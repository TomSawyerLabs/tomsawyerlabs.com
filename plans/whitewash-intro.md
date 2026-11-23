# Whitewash intro (prototype)

## Goal

A short entrance flourish on the home page: Tom whitewashes the fence, one
brush stroke per picket, left to right, ending at the partial and bare
pickets. Cameron asked for it as a prototype on a preview branch
(2026-11-22), after deciding against a "loading" animation (the prerendered
first frame is already the finished page).

## Environment

- Branch `whitewash-intro` (from `master` `1ea709e`), worktree
  `C:\Users\camer\.t3\worktrees\tomsawyerlabs.com\whitewash-intro`. Its own
  worktree so the :5181 review dev server (in the `fence-site` worktree)
  doesn't show the prototype.
- `node_modules` is a copy of the `fence-site` worktree's: `bun install`
  fails here on TLS fetching the `@tomsawyerlabs/ui` GitHub tarball (same as
  plans/tsl-site-expansion.md). A junction doesn't work: Vite resolves it to
  the other worktree and refuses to serve `/@fs/` files outside this one, so
  the dev server never hydrates.

## Decisions already made (don't re-ask)

- Name and tagline visible from the first frame; only the wash animates.
- Plays only when a visit starts on the home page; not on arriving or
  returning there by a link. Off for reduced motion.

## Design

- `fence.css`: `.intro .fence[data-hero] .picket::after` runs `whitewash`, a
  `clip-path: inset()` reveal top to bottom. Per-picket duration
  0.26–0.38 s (from `--shade`); delay 0.2 s + 24 ms × `--stroke`, the
  picket's on-screen place from the left (pickets that fit on screen, from
  `tan(atan2(100vw, w + gap))`, less `--from-right`). About 1.1 s total at
  1920 px.
- `root.tsx`: the head script adds `intro` with `js`. No JS, no intro.
- `Fence.tsx`: `--from-right` per picket; any non-hero fence removes
  `intro`. (A cleanup-on-unmount version broke in dev: StrictMode runs the
  cleanup at once.)

## Findings

- Checked on the production build: 59 whitewash animations on a fresh load
  of `/`; 0 after starting on `/pfms` and following the logo home; 0 after
  `/` → `/pfms` → `/` by links; 0 with reduced motion. Frames at 1920 px
  light/dark and 390 px look right (paused at fixed times).
- `clip-path` vs a `translateY` slide: at 4x CPU the intro overlaps
  hydration, and rAF only gets 2–17 main-thread frames in it either way. A
  CDP screencast (arrow nudge animation off) shows 17–22 distinct frames in
  the 750 ms of strokes for both, longest gap 50–67 ms. No smoother, and
  the slide moves the streak texture, so `clip-path` it is. Chrome reports
  composite failure 524288 for the transform version.
- Preview builds use Cloudflare's Worker Previews (open beta; the "Previews
  Base" tab in Build settings). Each branch gets its own trigger on its own
  Preview id (`fd31ca34…` for `whitewash-intro`, not the worker's
  `ea32bb24…`), so `bunx wrangler versions upload` fails the CI tag check:
  "The name in your wrangler.jsonc file (tomsawyerlabs-com) must match the
  name of your Worker" (build `625d3d3f`, 2026-11-22 8:13 PM PST). The
  command for Previews is `wrangler preview`. `bun builds` lists only the
  worker's own tag, so it doesn't show preview builds; the GitHub check run
  on the commit does.
- Tests: 53/54 pass; the one failure was the very-wide-screens test at its
  30 s limit, fixed on `master` with `test.slow()` (`3e62855`).

## Progress

- [x] Prototype (`32cb1c8`), pushed to `whitewash-intro`
- [ ] Preview URL: Preview command set to `bunx wrangler preview`
      (2026-11-22); building.
- [ ] Cameron reviews; then merge to `master` or tweak

## Open questions

1. Ideas if the look needs work: a ragged/soft brush edge instead of the
   straight one; slower strokes. Recommendation: see it live first.
