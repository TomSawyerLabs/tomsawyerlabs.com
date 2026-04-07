# tomsawyerlabs.com

Static site for [tomsawyerlabs.com](https://tomsawyerlabs.com), hosted on Cloudflare Pages.

## Development

```bash
bun install
bun run dev
```

## Build

```bash
bun run build
```

Generates static HTML via React Router v7 SSG into `build/client/`.

## Formatting

Code formatting is enforced by [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) and checked automatically on pre-commit via [lefthook](https://lefthook.dev/).

```bash
bun run fmt          # format all files
bun run fmt:check    # check without writing
```

Git hooks are installed automatically when you run `bun install` (via the `prepare` script).

## Testing

```bash
bun run test
```

## Deployment

Pushes to `master` trigger a GitHub Actions workflow that builds and deploys to Cloudflare Pages.
