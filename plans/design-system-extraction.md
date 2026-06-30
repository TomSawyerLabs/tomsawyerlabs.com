# Design System Extraction

## Goal

Share the Tom Sawyer Labs design system (interactive gradient background, base
styling, logo, layout shell) between the **public** marketing site
(`tomsawyerlabs.com`, this repo) and a future **private** internal site, without
exposing the internal site's source. Keep the shared design system **public**.

## Environment / context

- Repo: `github.com/TomSawyerLabs/tomsawyerlabs.com` — **PUBLIC**, org `TomSawyerLabs`.
- Stack: React Router v7 framework mode, SSG only (`ssr: false`, `prerender: true`),
  React 19, Vite 6, Bun, oxfmt + lefthook, Playwright tests. Deployed to
  Cloudflare Pages via GitHub Actions (`.github/workflows/ci.yml`) on push to `master`.
- Local working dir: `C:\Users\camer\git\Personal Projects\tomsawyerlabs.com`.

## Decisions already made (don't re-ask)

- Internal site lives in a **separate private repo** (not a branch/folder of a public repo).
- Reject **branch + cherry-pick** for sharing — divergent histories, no enforced boundary.
- Reject **submodule the whole site repo** — vendoring a full app to reach the CSS is awkward.
- Share the design system as a **package** with an explicit, versioned, one-directional API.
- Private site pulls the package via a **git dependency** (no publish infra to start).

## Key wrinkle discovered (needs user decision)

Git dependencies (`bun add github:org/repo`) install the **repo root** as the package.
Bun/npm do **not** cleanly support installing a _subdirectory_ of a git repo as a
package. So "design system in `packages/ui` subfolder of this site repo" + "private
repo consumes via plain git dependency" do **not** compose without either:
(a) publishing the package (GitHub Packages), or
(b) a subdir-capable installer (non-standard), or
(c) the package being its **own repo**.

### Resolution options

- **A — Dedicated public `TomSawyerLabs/ui` repo** (package at root). Both the public
  site and the private site consume it via git dependency. **CHOSEN.** Cleanly
  satisfies public + shared + git-dep + clean boundary. Cost: cross-repo local dev
  needs `bun link`/overrides to edit ui+site together.
- ~~B — Monorepo here~~ (rejected: conflicts with the git-dependency choice).

**Decision: A.** Design system becomes a sibling public repo `TomSawyerLabs/ui`
(package `@tomsawyerlabs/ui` at root). This site repo _consumes_ it via git dep.

## What is actually shareable (from current code)

Shared (→ design system package):

- **Gradient background**: `:root` color-scheme vars + `html` radial-gradient stack in
  `app/styles/global.css`, plus the `useGradientMouse` spring hook in
  `app/routes/home.tsx`. This is the signature visual ("interactive gradient
  background with spring physics"). Repackage as a `<GradientBackground>` component +
  hook + CSS.
- **Base CSS**: reset/typography (`body`, `h1`, `p`).
- **Logo**: `app/logo.svg` (brand asset, shared across TSL properties).
- **Footer shell** (parameterized — tagline is site-specific).

Site-specific (→ stays in the public site):

- `home.tsx` content (social-links nav, meta tags), `404.tsx`.
- `public/` assets (favicons, social PNGs).
- The `root.tsx` react-router `Layout` (`<Links>/<Meta>/<Scripts>`) — framework glue
  stays per-app; only the visual shell pieces come from the package.
- Footer tagline "Do the math, change the world!".

Note: design package should be **framework-agnostic** — plain React components + CSS +
hooks, no `react-router` dependency (peer at most). Each app keeps its own `root.tsx`.

## Execution decisions (locked)

- Topology **A**: dedicated public `TomSawyerLabs/ui` repo, package `@tomsawyerlabs/ui` at root.
- Create the GitHub repo now (authorized) and push.
- Scope: build the package **and** refactor this site to consume it; verify build + Playwright.
- Build: **tsdown** (oxc/Rolldown, matches oxfmt stack) via `prepare` lifecycle (build-on-install
  for git-dep consumers). No committed `dist/`.
- Local on-disk path for ui repo: `C:\Users\camer\git\Personal Projects\ui` (sibling).

## Package architecture (`@tomsawyerlabs/ui`)

```
ui/
├─ package.json            # name @tomsawyerlabs/ui, exports ".", "./styles.css"; prepare=build
├─ tsdown.config.ts        # entry src/index.ts, esm, dts, external react*
├─ tsconfig.json
├─ .oxfmtrc.json / lefthook.yml / .gitignore / README.md
├─ scripts/generate-logo.mjs   # reads src/logo.svg → src/logo.generated.ts (JSON.stringify)
└─ src/
   ├─ index.ts             # re-exports
   ├─ useGradientMouse.ts  # spring hook (moved verbatim from home.tsx)
   ├─ GradientBackground.tsx  # runs hook, returns null
   ├─ Footer.tsx           # <footer className="tsl-footer">{children}</footer>
   ├─ Logo.tsx             # div.tsl-logo + dangerouslySetInnerHTML={logoSvg}
   ├─ logo.svg             # byte-for-byte copy of app/logo.svg (source of truth)
   ├─ logo.generated.ts    # AUTO-GENERATED (gitignored)
   └─ styles.css           # :root gradient vars, html gradient, body/h1/p base, .tsl-logo, .tsl-footer
```

Exports: `GradientBackground`, `useGradientMouse`, `Footer`, `Logo`, `logoSvg`, and `@tomsawyerlabs/ui/styles.css`.
React/react-dom are **peerDependencies** (^19), external in the build. Package is framework-agnostic
(no react-router dependency).

## Site refactor (this repo)

- `app/root.tsx`: import `Footer`, `GradientBackground` + `@tomsawyerlabs/ui/styles.css` + `./styles/site.css`.
  Mount `<GradientBackground/>` in `<body>` (now site-wide incl. 404 — intentional improvement; previously
  home-only). `<Footer>Do the math, change the world!</Footer>`. Keep favicon links + RR `<Meta>/<Links>/<Scripts>`.
- `app/routes/home.tsx`: drop local `SPOTS`/`useGradientMouse`/`logo?raw`; render `<Logo/>`. Keep meta + social nav.
- `app/styles/global.css` → rename `site.css`, trimmed to site-only rules: `.container`, `.social-link*`,
  `.hero`, `.tagline`, `.back-link`, `.intro`. Shared rules move to package `styles.css`.
- Delete `app/logo.svg` (now owned by the package; still in git history).
- `tests/home.spec.ts` unchanged — should stay green.

## Verification / wiring strategy

1. `bun run build` in ui → confirm `generate` + tsdown emit `dist/` + types.
2. Site consumes ui locally via `file:../ui` (dist already built) → `bun run build` + `bun run test` (Playwright).
3. `gh repo create TomSawyerLabs/ui --public`, push, tag `v0.1.0`.
4. Switch site dep to `github:TomSawyerLabs/ui#v0.1.0`, `bun install`, rebuild → confirms git-dep + `prepare`
   build-on-install works (the path the private repo will use).
5. Leave site changes uncommitted; **ask before committing/pushing the site** (master auto-deploys).
6. Private repo (later) uses the same `github:TomSawyerLabs/ui#vX` dependency.

## Findings / gotchas

- Git/npm/bun git deps resolve repo **root** as the package; no clean subdir support.
- A **private** repo depending on a **public** package is fine; the reverse leaks.
- Keep the design package framework-agnostic so a future non-react-router consumer works.
- **Build-on-install (`prepare`) is fragile — 3 distinct install-time failures hit:**
  1. Bun blocks lifecycle scripts of deps by default → consumer must list the package in
     `trustedDependencies` (per-consumer; bun-specific; CI must have it, not interactive trust).
  2. tsdown's `tsdown.config.ts` can't be loaded under `node_modules` —
     `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`. Fixed by moving options to CLI flags.
  3. Even after that, the on-install build emits `index.js` but **not** `index.d.ts`
     (tsdown's dts step no-ops outside its own repo root, even with typescript +
     rolldown-plugin-dts hoisted). Reproduced via manual rebuild in `node_modules`.
- Local builds (in the ui repo root) DO emit `dist/index.d.ts` correctly.

### RESOLVED — keep build-on-install, fix dts via tsc (user choice)

The three failures are all fixable; build-on-install now works end-to-end:

1. `trustedDependencies: ["@tomsawyerlabs/ui"]` in every consumer's `package.json`
   (honored non-interactively → CI-safe). **Mandatory** or `dist/` is never built.
2. Build options moved to **CLI flags** (no `.ts` config under node_modules).
3. **`.d.ts` generated by `tsc --emitDeclarationOnly`, not tsdown.** tsdown/
   rolldown-plugin-dts hard-skip declaration emit under node_modules (both tsc and oxc
   isolated modes); plain `tsc` with an explicit `include` does emit there.
   Build = `generate && tsdown … (JS bundle) && tsc --emitDeclarationOnly … (types)`.
   Added explicit return types + `isolatedDeclarations`/`declaration` in tsconfig.

ui is at **v0.1.2** (the working version). Verified via a clean git install into the
site: `dist/` has `index.js` + full `.d.ts` tree; site typecheck/build/Playwright all pass.

## Things not to do

- Don't branch+cherry-pick. Don't submodule the whole site repo.
- Don't put any private/internal code in this public repo.
- Don't add `react-router` as a hard dependency of the design package.
- Branch before committing (currently on `master`, the deploy branch).

## Progress log

- [x] Confirmed repo is public; current site is pure SSG, ~250 lines of shareable design.
- [x] User chose package + git dependency; topology A (dedicated ui repo).
- [x] Built `@tomsawyerlabs/ui` (gradient, Logo, Footer, base CSS); pushed to
      github.com/TomSawyerLabs/ui (public). Tags v0.1.0→v0.1.2.
- [x] Resolved the three build-on-install gotchas (trustedDependencies, CLI flags, tsc dts).
- [x] Refactored the site to consume `github:TomSawyerLabs/ui#v0.1.2`; added trustedDependencies.
- [x] Verified clean git install: typecheck + build + Playwright (chromium) all pass.
- [ ] **Commit/push the SITE changes — NOT yet done; awaiting user go-ahead** (master auto-deploys
      to Cloudflare Pages). Site working tree has the refactor + the user's RandomQuote footer edit.
- [ ] Follow-ups: optional CI workflow on the ui repo (typecheck/build/fmt); confirm Cloudflare
      Pages build runs the prepare build (it should, via trustedDependencies); later: private repo.
