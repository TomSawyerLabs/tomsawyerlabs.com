# tomsawyerlabs.com

The public site for [Tom Sawyer Labs](https://tomsawyerlabs.com), the
open-source and public-benefit side of [TWILL Technology](https://twilltech.com).
A static site (React Router SSG) served as Cloudflare Workers static assets.

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
- Nothing is lost while the server is down or restarting: the browser keeps
  every comment, reply, resolve and delete (attachments included) in an
  outbox in IndexedDB (`app/review/outbox.ts`), shows them as waiting, and
  sends them once the server answers again. Each carries a key the server
  uses to ignore repeats. Half-written text survives Vite's reload too.
- Comments live in `review/comments.json` (gitignored; `REVIEW_DIR` moves
  them, which the tests use to keep to a scratch folder). `bun run review`
  prints the open ones as Markdown (`--all` includes resolved).
- **Webhook:** with `review/webhook.json` (`{"url", "secret"}`, gitignored)
  the server POSTs every reviewer comment, reply, withdrawal and reopen
  there, signed with HMAC-SHA256 in `x-review-signature: sha256=<hex>`. Ours
  points at a T3 Code scheduled task ("On webhook", signature required) that
  posts each one into a single Claude thread. While it's set, the panel
  shows that Claude is watching. Claude's own replies aren't sent.
- **Shot list:** `http://<LAN IP>:<port>/__shots?name=Name` is a phone page
  for taking the site's photos. It walks you place by place through the
  shots in `review/shots.ts` (edit that to change the list), lets you skip a shot for now (it comes back last) or for good, files each
  photo against its shot or as an extra for any project, and keeps photos on
  the phone until they've uploaded. Photos land in `review/uploads/`, the
  filing in `review/shots.json` (gitignored); `bun run shots` lists them
  with their files (`--open` for what's still needed).
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

Cloudflare Workers Builds builds the `tomsawyerlabs-com` Worker (static
assets only, `wrangler.jsonc`) with `bun run build` and deploys it with
`bunx wrangler deploy` on every push to `master`; other branches get a
`*.workers.dev` preview URL. The hostnames (tomsawyerlabs.com, www and
next.tomsawyerlabs.com) are attached in the ops repo. The GitHub Actions
workflow only checks formatting, types, tests and the build.

```bash
bun run build && bun run preview   # the built site under wrangler dev
```
