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

## Testing

```bash
bun run test
```

## Deployment

Pushes to `master` trigger a GitHub Actions workflow that builds and deploys to Cloudflare Pages.
