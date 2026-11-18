// Lists the photos taken against the shot list (/__shots on the dev server)
// as Markdown: each shot with its photos' files on disk, what's still open,
// and the extra photos by project.
//
//   bun run shots          # everything
//   bun run shots --open   # only the shots still needing a photo

import { readShots, uploadPath } from "../review/plugin";
import { PLACES, SHOTS } from "../review/shots";

const { photos, skipped } = readShots();
const openOnly = process.argv.includes("--open");
const lines: string[] = [];

for (const place of PLACES) {
  const shots = SHOTS.filter((s) => s.where === place);
  const rows = shots.flatMap((s) => {
    const mine = photos.filter((p) => p.shot === s.id);
    const state = mine.length
      ? `${mine.length} photo${mine.length > 1 ? "s" : ""}`
      : skipped.includes(s.id)
        ? "skipped"
        : s.optional
          ? "open (optional)"
          : "OPEN";
    if (openOnly && (mine.length || skipped.includes(s.id))) return [];
    return [
      `- **${s.project}** · ${s.title} (\`${s.id}\`): ${state}`,
      ...mine.map((p) => `  - ${p.by}, ${p.at}: ${uploadPath(p.url)}`),
    ];
  });
  if (rows.length) lines.push(`## ${place}`, "", ...rows, "");
}

const extras = photos.filter((p) => !p.shot);
if (extras.length && !openOnly) {
  lines.push("## Other photos", "");
  for (const p of extras) {
    lines.push(`- **${p.project}** · ${p.by}, ${p.at}: ${uploadPath(p.url)}`);
  }
  lines.push("");
}

console.log(lines.join("\n").trim() || "Nothing yet.");
