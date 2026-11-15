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
  tomsawyerlabs.com. No public repo for the scheduler or ball counter.
  `avr-test-hat` (featured on the showcase branch) no longer exists by that
  name; `mcu-hil` looks like its successor.

## What the showcase branch has

- Hero kept as the first full screen, then scroll-down project sections.
- Scroll-reveal that is safe without JS (`.js` class set before paint; content
  visible by default; reduced-motion respected).
- Project cards with photo slots in `public/projects/` that fall back to a
  styled placeholder.
- Two simulated "live demos": a pFMS field radio monitor (random signal
  jitter) and an AVR test runner (scripted pass/fail).
- About 1,050 added lines across `home.tsx`, `global.css`, `root.tsx`, tests.

Why it doesn't rebase cleanly: master deleted `global.css`, moved the logo,
gradient and footer into `@tomsawyerlabs/ui`, and rewrote `root.tsx`. The
branch edits exactly those files, so every hunk conflicts.

## Options (awaiting Cameron's pick)

1. **Rebase the branch.** Every file conflicts; resolving means rewriting the
   branch's CSS and root against the ui package anyway. Same work as option 2,
   with a misleading history. Not recommended.
2. **Re-port the useful pieces onto a new branch from master** (recommended).
   Keep the scroll-reveal, the no-JS safety, the card and photo-slot pattern
   and the section CSS, moved into `site.css` on top of the ui package.
   Restructure for seven projects: overview page plus `/<project>` pages,
   like the TWILL site. Roughly a session of work before new content.
3. **Start fresh from master.** Loses tested no-JS and reveal work for no
   gain. Not recommended.

## Decisions already made (don't re-ask)

- Bubble Blade is not public: no name, mechanism or details anywhere.
- Name a client only when its patent lists Chris or Cameron.
- No HTML `title=` tooltips.
- Don't start a parallel TSL redesign without deciding what happens to the
  showcase branch (carried over from the TWILL plan).

## Plan / steps

1. [x] Survey master, the showcase branch, the TWILL site's TSL copy and the
       org's public repos.
2. [ ] **Current:** Cameron picks the base and answers the open questions.
3. [ ] Build per that choice. Not started.

## Open questions for Cameron

1. Base: rebase, re-port or fresh? (Recommend re-port.)
2. Structure: one long scroll page, or overview plus a page per project?
   (Recommend overview plus pages; seven projects is too many for one scroll.)
3. Simulated demos: keep them, clearly labelled as simulations, or drop them
   for real screenshots and video? (Recommend real media, keeping at most one
   labelled demo.)
4. Scheduler and ball counter have no public repo. Describe them without a
   code link, or hold them until they're published?

## Findings / gotchas

- The showcase branch exists only locally. Deleting that worktree loses it.
- Uncommitted edit to `plans/design-system-extraction.md` on master belongs to
  another thread; leave it.

## Things not to do

- Don't rebase or delete the showcase branch until Cameron decides.
- Don't present simulated demos as live data.
