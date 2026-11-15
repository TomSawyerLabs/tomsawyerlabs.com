/**
 * The review watcher: a Claude session runs this under a background monitor
 * and gets one JSON line per review comment as it arrives, so it can act on
 * Chris's and Cameron's comments while they review (review/plugin.ts).
 *
 *   bun run review:watch                 # just watch
 *   bun run review:watch --discuss       # ...and offer 🧵 Discuss (T3 Code only)
 *   bun run review:watch --port 5173     # another dev server (default 5181)
 *   bun run review:watch --all           # also report comments already open
 *
 *   bun run review:watch --reply <id> "text"     # answer on a comment, as Claude
 *   bun run review:watch --resolve <id>          # mark it resolved
 *
 * Each line: {"event","id","kind","path","author","quote","body","selector",
 * "attachments"} where `event` is
 *   - `added`: a new open comment (or one already open when the watcher
 *     started). `kind: "discuss"` asks the session to start a new T3 thread
 *     about the quote: launch it, then `--reply` with its link and
 *     `--resolve`.
 *   - `reply`: someone other than Claude replied on a comment.
 *   - `withdrawn` (with `how`: "resolved" | "deleted"): the reviewer took it
 *     back. Stop, and undo anything already done for it.
 *   - `reopened`: open again.
 * Status lines start with `#`, so a quiet watcher can be told from a dead one.
 *
 * `--discuss` tells the page that this session can start conversations; the
 * page shows the Discuss button only while such a watcher is alive. Pass it
 * only from a session that can launch T3 threads.
 */

import { basename } from "node:path";
import type { ReviewComment } from "../review/plugin";
import { UPLOADS_DIR } from "../review/plugin";

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const value = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const port = Number(value("--port") ?? 5181);
const base = `http://127.0.0.1:${port}/__review`;
/** Replies the watcher itself posts are signed with this name. */
const AGENT = "Claude";

async function call(path: string, init?: RequestInit) {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

// One-off commands.
const replyId = value("--reply");
if (replyId) {
  const text = args[args.indexOf("--reply") + 2];
  await call(`/comments/${replyId}`, {
    method: "PATCH",
    body: JSON.stringify({ author: AGENT, reply: text }),
  });
  console.log(`replied on ${replyId}`);
  process.exit(0);
}
const resolveId = value("--resolve");
if (resolveId) {
  await call(`/comments/${resolveId}`, {
    method: "PATCH",
    body: JSON.stringify({ resolved: true }),
  });
  console.log(`resolved ${resolveId}`);
  process.exit(0);
}

// Watching.
const discuss = flag("--discuss");
/** Report comments already open at start too (default: only new ones). */
const all = flag("--all");
type Seen = { resolved: boolean; replies: number };
const seen = new Map<string, Seen>();
let connected = false;
let first = true;

function emit(event: string, c: ReviewComment, extra: object = {}) {
  console.log(
    JSON.stringify({
      event,
      id: c.id,
      kind: c.kind ?? "comment",
      path: c.path,
      author: c.author,
      quote: c.quote,
      body: c.body,
      selector: c.anchor.selector,
      attachments: c.attachments.map((a) =>
        `${UPLOADS_DIR}/${decodeURIComponent(basename(a.url))}`.replace(
          /\\/g,
          "/",
        ),
      ),
      ...extra,
    }),
  );
}

async function poll() {
  let comments: ReviewComment[];
  try {
    comments = await call("/comments");
    if (!connected) {
      console.log(
        `# connected to ${base}${discuss ? " (offering Discuss)" : ""}`,
      );
      connected = true;
    }
  } catch (error) {
    if (connected) console.log(`# lost ${base}: ${error}; retrying`);
    connected = false;
    return;
  }

  const now = new Set<string>();
  for (const c of comments) {
    now.add(c.id);
    const before = seen.get(c.id);
    const replies = c.replies.filter((r) => r.author !== AGENT);
    if (!before) {
      if (!c.resolved && (all || !first)) emit("added", c);
    } else {
      // Resolved right after Claude's own reply: the session closing a
      // request it handled, not the reviewer withdrawing it.
      const byAgent = c.replies.at(-1)?.author === AGENT;
      if (!before.resolved && c.resolved && !byAgent) {
        emit("withdrawn", c, { how: "resolved" });
      }
      if (before.resolved && !c.resolved) emit("reopened", c);
      for (const r of replies.slice(before.replies)) {
        emit("reply", c, { reply: { author: r.author, body: r.body } });
      }
    }
    seen.set(c.id, { resolved: c.resolved, replies: replies.length });
  }
  for (const [id] of seen) {
    if (!now.has(id)) {
      console.log(JSON.stringify({ event: "withdrawn", id, how: "deleted" }));
      seen.delete(id);
    }
  }
  if (first) {
    const open = comments.filter((c) => !c.resolved).length;
    console.log(
      all
        ? `# ${open} open`
        : `# ${open} already open (not listed; --all lists them). Watching for new ones.`,
    );
    first = false;
  }
}

async function heartbeat() {
  try {
    await call("/watcher", {
      method: "POST",
      body: JSON.stringify({ discuss }),
    });
  } catch {
    // poll() reports connection trouble.
  }
}

await heartbeat();
await poll();
setInterval(poll, 3000);
setInterval(heartbeat, 10_000);
