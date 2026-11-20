# Tom Sawyer Labs site expansion

## Goal

Turn tomsawyerlabs.com from a one-screen splash into the full public site for
Tom Sawyer Labs, the public-benefit and open-source arm of TWILL Technology.
Chris wants it to read as "a gift to the FIRST Robotics community". The new
TWILL site's `/tomsawyerlabs` page links here.

Content to cover eventually: the practice field, pFMS, the scheduler, the ball
counter, Empyrean Gate, the HIL runner and clearance.

## Environment / context

- Repo: `C:\Users\camer\git\Personal Projects\tomsawyerlabs.com`, remote
  `TomSawyerLabs/tomsawyerlabs.com` (public). Branch `master`, head `48c4704`.
- Stack: React Router v7 full SSG, Vite, React 19, Bun, oxfmt + lefthook,
  Playwright tests. Shared look comes from `@tomsawyerlabs/ui`
  (`github:TomSawyerLabs/ui#v0.2.0`, shipped as source): `Logo`, `Footer`,
  `GradientBackground`, `styles.css`. Site-only CSS is `app/styles/site.css`.
- Hosting: Cloudflare Pages project `tomsawyerlabs-com` (ops repo
  `cloudflare/config/isozilla/tomsawyerlabs.yaml`). Infra changes need
  Cameron's per-change yes.
- Existing redesign branch: `t3code/add-projects-showcase`, commit `f80a0db`
  (2026-06-30), worktree `C:\Users\camer\.t3\worktrees\tomsawyerlabs.com\t3code-b9f5fee7`.
  Local only (not on origin). The worktree's uncommitted diff is line endings
  only. Its plan: `plans/projects-showcase.md` on that branch.
- TWILL site: `C:\Users\camer\.t3\projects\new-twill-website`, preview
  https://next.twilltech.com/tomsawyerlabs. Its TSL copy lives in
  `app/content/projects.ts` (slug `tomsawyerlabs`): East Palo Alto, about 20
  Bay Area FRC teams, Cameron is a Team 8 alum and 2023 SVR Volunteer of the Year.
- Public TomSawyerLabs repos (2026-11-15): practice-field-management-system,
  empyrean-gate, hil-runner, mcu-hil, clearance, ui, plan-presenter,
  tomsawyerlabs.com. Correction (2026-11-15): the scheduler and ball counter
  _are_ public, under `cinderblock/` (`practice-field-scheduler`,
  `balls-counter`), not the TomSawyerLabs org. Many other candidate TSL
  projects also live under `cinderblock/` (see "Candidate projects").
  `avr-test-hat` (featured on the showcase branch) is succeeded by `mcu-hil`.

## Current build

- Branch `fence-site`, worktree
  `C:\Users\camer\.t3\worktrees\tomsawyerlabs.com\fence-site`, started from
  master and rebuilt from `ssg-base` (React Router 8, Vite 8, TS 7), like the
  TWILL site. The June showcase branch is not used.
- Fence hero: `app/components/Fence.tsx`, `app/styles/fence.css`. Pickets are
  CSS (clip-path tips, SVG-noise grain and lime-wash streaks); the last two
  pickets are half-painted and bare. JS pins it and shrinks it into a 76px
  bar on scroll, moving the logo into the corner; without JS it's a static
  full-screen block.
- Theme: whitewashed paper below, Permanent Marker headings, Inter body,
  hand-drawn card corners, barn-red accent, moonlit night in dark mode.
- Content: `app/content/projects.ts`, drafted from each repo's README by a
  subagent. 45 entries, 33 with their own page.

## Decisions already made (don't re-ask)

- Structure: overview page plus one page per project (Cameron, 2026-11-15).
- Demos: real screenshots and video; at most one demo, labelled as a
  simulation (Cameron, 2026-11-15).
- Scheduler and ball counter: leave them off; "we have other better things to
  show off" (Cameron, 2026-11-15).
- Start from scratch like the TWILL site, with a distinct identity: a
  fence with the name painted on it that shrinks into the top bar on scroll,
  then projects, then a page per project. Keep the SVG logo (Cameron,
  2026-11-15).
- Embedded testing: mcu-hil replaces avr-test-hat; may be one bigger
  "embedded testing" category covering hil-runner, mcu-hil and friends.
- TSL is about more than FIRST Robotics. The site's framing must cover the
  wider open-source and public-benefit work, with FIRST as one part.

- Bubble Blade is not public: no name, mechanism or details anywhere.
- Name a client only when its patent lists Chris or Cameron.
- No HTML `title=` tooltips.
- Don't start a parallel TSL redesign without deciding what happens to the
  showcase branch (carried over from the TWILL plan).

## Plan / steps

1. [x] Survey master, the June showcase branch, TWILL's TSL copy, the repos.
2. [x] Cameron's answers: structure, demos, project list, start fresh.
3. [x] Fence hero and top bar, theme, home page, project template, 404.
4. [x] Project copy for all 45 entries from READMEs; tests; README.
5. [x] "On the playa" category: HyparHuts rewritten from the HyparHut design
       repo (GPL-3.0), HyparShade, and stubs for cupcake trikes and bumper cars.
       5a. [ ] **Current:** Cameron reviews the fence and the copy, and supplies
       the cupcake trike and bumper car stories.
       5b. [x] Review mode ported from the TWILL site (`7474a56`). Review server
       for Chris: hidden detached `bun run dev --port 5181` in the fence-site
       worktree (log in `review/server.log`, gitignored). LAN URL
       `http://10.255.0.77:5181/?reviewer=Chris`. Emailed Chris
       (chris@tacklind.com) the link and instructions, 2026-11-15
       (Gmail thread 1a1de70e7ac09ed5). No `review:watch` running yet;
       comments wait in `review/comments.json` (`bun run review`).
       5c. [x] Review webhook (Cameron: "message to a single claude thread"). The
       review server POSTs each reviewer event, HMAC-signed, to the T3
       scheduled task "TSL site review comments"
       (`scheduled-task:2dcfb9bd-45e0-43b3-869f-53caecddebff`, On webhook,
       signature required, bound to the TSL site thread, same conversation).
       URL: local T3 server `http://127.0.0.1:3773/api/hooks/<task>/<token>`
       (T3 Connect is off, so there's no public URL; the token was read
       read-only from `~/.t3/userdata/statev2.sqlite`). URL and secret are in
       `review/webhook.json` (gitignored). Verified: unsigned -> 401, signed
       test -> 202. If the token is rotated, update webhook.json.
6. [ ] Group pages (AVR toolkit, Saleae analyzers, Caddy modules), if wanted.
7. [ ] Real photos and screenshots per project. Cameron and Chris take
       photos on their phones with the shot list page,
       `http://10.255.0.77:5181/__shots` (`7f1de32`, 2026-11-17). The list is
       `review/shots.ts`; `bun run shots` shows what's in and where the files
       are. Then place them on the pages. (The earlier Claude Doc version,
       https://claude.ai/artifact/4b2seKYHTSnvDuhTj3a5Bu, is superseded.)
       7a. [ ] **Current:** preview at `next.tomsawyerlabs.com`, hosted on a
       Cloudflare Worker like the TWILL site (Cameron, 2026-11-18: "switch to
       CF workers for tsl hosting too"; Pages is dropped). Repo side done in
       `ce32e66`: `wrangler.jsonc` (Worker `tomsawyerlabs-com`, assets only),
       `public/_headers` noindex, `bun run preview` = wrangler dev (checked:
       pages 200, `/x/` 307 to `/x`, unknown 404 with the 404 page, noindex
       header). Steps, each with Cameron's yes: - [x] ops `9d50620a` (CI run 44605039726, 2026-11-19):
       `next.tomsawyerlabs.com` -> Worker `tomsawyerlabs-com`. - [x] `fence-site` pushed to origin (2026-11-19). - [x] Workers Builds connected by Cameron (2026-11-19): branch
       `fence-site`, build `bun run build`, deploy `bunx wrangler deploy`,
       previews on, `BUN_VERSION` 1.4.4. - [ ] First build and check of next.tomsawyerlabs.com. - [ ] Launch, see step 8.
       Locally `bun add` still fails on the ui github tarball (TLS); wrangler
       was added by taking ui out of package.json for the add and restoring
       its lock entry by hand.
8. [ ] Launch. Needs Cameron's yes, and not before the photos are in
       (Cameron, 2026-11-15). In order: (a) merge `fence-site` into
       `master` and push (still deploys the new site to Pages too, harmless);
       (b) Workers Builds production branch -> `master` (Cameron, dashboard);
       (c) remove the noindex rule in `public/_headers`, push; (d) ops: move
       `tomsawyerlabs.com` and `www` from `pages:` to the Worker, keep `next.`
       as an alias or drop it, apply; (e) ops: retire the Pages project.

## Open questions for Cameron

1. ~~Fence direction~~: "good start for now" (Cameron, 2026-11-15).
2. ~~Practice field booking link~~: not applicable. Photos: Cameron will
   supply them.
3. ~~claude-usage window priming~~: keep it and scheduled messages off
   the site (Cameron, 2026-11-15).
4. ~~HyparHuts copy thin~~: rewritten from `cinderblock/HyparHut`'s README.
5. ~~LICENSE files~~: add later as a separate job (Cameron, 2026-11-15).
   10 linked repos lack one (mcu-hil, hil-runner, uMaker, usb-dfu,
   print-template, HyparShade, telemetry-collector, smtp-bridge, wifi-tester,
   plan-presenter).
6. ~~Group pages~~: no, small pieces stay as cards (Cameron, 2026-11-15).
7. ~~Review notifications~~: webhook into this Claude thread, live and
   tested (2026-11-15).
8. Cupcake trikes and playa bumper cars (2026-11-15, Cameron: "don't forget
   HyparHuts, cupcake trikes, playa bumper cars... I'm sure we've got more").
   Listed under "On the playa" with a "write-up coming" label. Asked Chris
   to elaborate (email reply in thread 1a1de70e7ac09ed5, 2026-11-15). Need: what they are, what TSL built, photos, any repo or links. Only
   found so far: Math Camp's Burning Man applications call the camp "home of
   the fabulous Electric Cupcakes", and a 2014 `cupcakes` photo folder in
   Drive. Nothing on the bumper cars.
9. ~~More projects from `P:\Projects`~~: FoldHaus, Burn Bed, Quasar and
   Skull stay off the site (Cameron, 2026-11-15).

## TSL projects (Cameron, 2026-11-15)

In:

- Embedded testing: mcu-hil, hil-runner, BootBob, BenchBob, avrload, AVR,
  uMaker, usb-dfu, the three Saleae Logic analyzers.
- EDA and lab tools: electronics-workbench-decoder, multisim2kicad, loupecam,
  HotPi, cad-preview.
- Fabrication: FarmSlicer, print-template, HyparHuts.
- Shop and space: practice field + pFMS, clearance, punchlist, bins.
- Self-hosting: uptime-tracker, telemetry-collector, smtp-bridge,
  dns01-issuer, caddy-dns01 / caddy-onlink / caddy-librespeed, wifi-tester,
  system-resource-manager, actions-spend-pacer.
- Windows and desktop: ghostcom, plugsight, open-task, open-fan.
- Libraries: react-smoothie, node-deluge-rpc.
- Also TSL: LibreBooks, LibreHours, claude-usage, skills-editor.
- Already in the TSL org: plan-presenter (not yet discussed).

Out:

- Light and sound (Empyrean Gate, netBeat, awesome LED list): "more Cameron
  personal, at least for now". This overrides the original brief, which
  listed Empyrean Gate.
- Personal: OpenSlate, svdsa, jarlid, apitorrent.
- Client work: those are usually TWILL clients, not TSL.
- Repos under `cinderblock/`: link them where they are, for now.

## Findings / gotchas

- The showcase branch exists only locally. Deleting that worktree loses it.
- Uncommitted edit to `plans/design-system-extraction.md` on master belongs to
  another thread; leave it.

- `bun add`/`bun install` of `github:TomSawyerLabs/ui` fails on this
  machine with `UNKNOWN_CERTIFICATE_VERIFICATION_ERROR downloading tarball`
  (also outside the sandbox, in PowerShell, and with NODE_EXTRA_CA_CERTS set
  to the Windows roots), while curl fetches the same codeload URL fine.
  Workaround: the ui lock entry was copied from master's bun.lock and the
  package copied (`cp -rL`) from master's node_modules. CI is unaffected.
- Preview screenshots sometimes time out once; a retry works.

- Review outbox (2026-11-15, `873f316`): Cameron asked that the browser
  hold comments while the review server is down and send them when it's
  back. Done with an IndexedDB outbox plus server-side dedupe keys; tested
  in `tests/review.spec.ts` (all three browsers). Before this, a comment
  saved while the server was down was silently lost. The TWILL site's
  overlay (where this one came from) still has that gap.
- The review server needs its folder to exist before writing; with
  `REVIEW_DIR` pointing somewhere new, saves 500'd until `writeComments`
  learned to create it. Playwright also empties `test-results/` at the start
  of a run, so test review data lives in the OS temp folder instead.

- Workers Builds (2026-11-19): the first build of `fence-site` ran deploy
  command `npx wrangler preview` and failed ("missing a `previews` block").
  The Builds API listed one trigger, branch `fence-site`, deploy
  `npx wrangler preview`, while the dashboard's Production tab showed branch
  `fence-site` and `bunx wrangler deploy`. The dashboard now has a
  "Previews Base" tab next to Production (Workers previews, open beta).

- Fence scroll performance (2026-11-20): shrinking the hero by setting its
  height each frame re-rasterized all 44 noise-textured pickets plus an
  animated drop-shadow blur on the logo every frame (headless Chrome, 240
  frames: ~140 s raster, 227 paints, p50 frame 150 ms). Now transforms and
  opacity only: the header slides up behind its own clip while its stage
  slides back down, and the logo's halo is a pre-blurred copy that fades in
  (0.2 s raster, 5 paints, p50 16.8 ms). Then moved to CSS scroll-driven
  animations (`fence-*` in `fence.css`, sizes as CSS vars, length ratios via
  `tan(atan2(a, b))`), so Chrome and Safari need no scroll JS at all; Firefox
  (no `animation-timeline` yet) gets the same paused animations scrubbed from
  a scroll listener in `Fence.tsx`. Measure with
  `bun run perf:scroll <url> [light|dark]`. Don't animate the fence's
  height, `--p`-driven CSS, or a filter radius per frame again.
- `tests/review.spec.ts` "server is down", "answer is lost" and "half-written
  comment" fail on a clean checkout too (2026-11-20), not from the fence work.

## Things not to do

- Don't build on the June showcase branch; Cameron chose to start fresh.
  Leave that branch alone until he says to delete it.
- Don't present simulated demos as live data.
