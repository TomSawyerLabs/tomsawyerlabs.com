// Prints the review comments left on the dev server (review/plugin.ts) as
// Markdown, grouped by page, with the full path of every attached file.
// `bun run review` (add `--all` for resolved ones).

import {
  type ReviewAttachment,
  uploadPath,
  readComments,
} from "../review/plugin";

const all = process.argv.includes("--all");
const comments = readComments().filter((c) => all || !c.resolved);
if (!comments.length) {
  console.log(all ? "No review comments." : "No open review comments.");
  process.exit(0);
}

const local = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    dateStyle: "medium",
    timeStyle: "short",
  }) + ` (${iso.slice(11, 16)}Z)`;

function files(list: ReviewAttachment[], indent: string) {
  for (const f of list) {
    const path = uploadPath(f.url);
    console.log(
      `${indent}- 📎 ${f.name} (${(f.size / 1e6).toFixed(1)} MB): ${path}`,
    );
  }
}

for (const path of [...new Set(comments.map((c) => c.path))].sort()) {
  console.log(`\n## ${path}\n`);
  for (const c of comments.filter((x) => x.path === path)) {
    console.log(
      `- **${c.author}**, ${local(c.createdAt)}${c.resolved ? " (resolved)" : ""} [${c.id.slice(0, 8)}]`,
    );
    console.log(`  - On: \`${c.anchor.selector}\` "${c.anchor.text}"`);
    if (c.quote) console.log(`  - Quote: "${c.quote.replace(/\s+/g, " ")}"`);
    if (c.body) console.log(`  - ${c.body.replace(/\n/g, "\n    ")}`);
    files(c.attachments, "  ");
    for (const r of c.replies) {
      console.log(`  - ↳ **${r.author}**, ${local(r.createdAt)}: ${r.body}`);
      files(r.attachments, "    ");
    }
  }
}
