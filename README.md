# tomsawyerlabs.com

The public site for [Tom Sawyer Labs](https://tomsawyerlabs.com), the
open-source and public-benefit side of [TWILL Technology](https://twilltech.com).
A static site (React Router SSG) hosted on Cloudflare Pages.

The home page opens on Tom Sawyer's fence with our name painted on it. As you
scroll, the fence shrinks into the top bar and the projects come up underneath.
Every project with its own page lives at `/<slug>`.

## Where things are

- `app/content/projects.ts`: everything the site says about our projects and
  their categories. Add a project here; `page: true` gives it its own page.
- `app/components/Fence.tsx` and `app/styles/fence.css`: the fence hero and top
  bar.
- `app/routes/`: the home page, the project page template and the 404 page.
- The logo comes from [`@tomsawyerlabs/ui`](https://github.com/TomSawyerLabs/ui).

Rules for content: don't name a client unless its patent lists Chris or
Cameron, and don't use HTML `title=` tooltips.

## Development

```bash
bun install
bun run dev
```

## Build

```bash
bun run build
```

Prerenders every page to static HTML in `build/client/`, then checks that
`404.html` is the not-found page.

## Review mode (dev server only)

`bun run dev` also serves a review overlay, so reviewers on the LAN can pin
comments to the live pages. It never ships: `import.meta.env.DEV` drops it
from builds, the API is a dev-only Vite plugin (`review/plugin.ts`), and
`bun run build` fails if review code reaches `build/client`. Ported from the
TWILL site.

- Share `http://<this machine's LAN IP>:<port>/?reviewer=Name`; the name is
  remembered in that browser. Callers from outside our networks are refused.
- **💬 Review** (bottom left) → **+ Add a comment** → click anything on the
  page, or select text first. Threads support replies, resolve and
  attachments (stored at full resolution in `review/uploads/`, gitignored).
- Comments live in `review/comments.json` (gitignored). `bun run review`
  prints the open ones as Markdown (`--all` includes resolved).
- `bun run review:watch` streams new comments for a Claude session to act on
  (`--port`, default 5181; see the script's header for `--reply`,
  `--resolve` and `--discuss`).

## Formatting

[oxfmt](https://oxc.rs/docs/guide/usage/formatter.html), checked on pre-commit
by [lefthook](https://lefthook.dev/) (installed by `bun install`).

```bash
bun run fmt          # format all files
bun run fmt:check    # check without writing
```

## Testing

```bash
bun run test
PORT=5193 bun run test   # if something else already has port 5173
```

## Deployment

Cloudflare Pages builds and deploys `master`. The GitHub Actions workflow only
checks formatting, types, tests and the build.
