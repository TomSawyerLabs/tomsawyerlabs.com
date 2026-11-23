# Issues

## Firefox: "404 page › shows not found with a link home" fails intermittently

Seen 2026-11-21 in full `bun run test` runs (all three browsers in parallel on
the dev server), about 1 run in 4; passes 16/16 when run alone
(`--project=firefox -g 404 --repeat-each=8`). The dev server logs
`[vite] (client) [Unhandled rejection] AbortError: A request was aborted, for
example through a call to IDBTransaction.abort.` around the same time. Flaky
tests hide real failures, so worth finding.

Also seen 2026-11-22 in one full parallel run (machine under load): Firefox
"the logo still draws after client-side navigation", both Firefox "Background
glow" tests, and WebKit `review.spec.ts` "a send whose answer is lost is not
posted twice" (`Waiting to send` stayed visible). All 26 Firefox/WebKit tests
in those files then passed with `--workers=2`.

Again 2026-11-22 (`whitewash-preview` branch, full parallel run): Firefox
"lists projects that link to their pages"; it passed 3 of 3 on its own.

## Shrink the logo's path data in @tomsawyerlabs/ui

`src/logo.svg` in TomSawyerLabs/ui is 52 KB. `svgo -p 1` takes it to 27 KB
(10 KB Brotli, from 20 KB) and renders identically (3 pixels differ at 1520 px
wide); `-p 0` gets 11 KB but visibly moves edges at large sizes. Needs a ui
release and a dependency bump here (`bun add` of the github dependency fails
locally on TLS; see plans/tsl-site-expansion.md).
