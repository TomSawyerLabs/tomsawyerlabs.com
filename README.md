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
