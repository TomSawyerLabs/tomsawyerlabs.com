// The review server: a small comment API inside the dev server, so reviewers
// on the LAN can pin comments (and attach full-resolution pictures) to the
// live pages (see app/review/). It exists only under `vite dev`
// (`apply: "serve"`), so it is never part of a build.
//
// Comments live in review/comments.json and attachments in review/uploads/,
// both gitignored. Uploads are stored byte-for-byte: no resizing or
// recompression, so originals can go straight onto the site. `bun run review`
// prints the comments as Markdown.
//
// Webhook: when review/webhook.json ({"url", "secret"}, gitignored) exists,
// every reviewer comment, reply, withdrawal and reopen is also POSTed there,
// signed with HMAC-SHA256 in `x-review-signature: sha256=<hex>`. It points at
// a T3 scheduled task that posts each one into a single Claude thread, so no
// watcher has to stay running. Claude's own replies and resolves (author
// "Claude", from `bun run review:watch --reply/--resolve`) are not sent.

import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createHmac, randomUUID } from "node:crypto";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";

export const COMMENTS_FILE = fileURLToPath(
  new URL("./comments.json", import.meta.url),
);
export const UPLOADS_DIR = fileURLToPath(new URL("./uploads", import.meta.url));

/** Largest single upload: big enough for raw camera files and PDFs. */
const MAX_UPLOAD = 200 * 1024 * 1024;

export type ReviewAnchor = {
  /** CSS selector for the element the comment is pinned to. */
  selector: string;
  /** The start of the element's text, to re-find it if the page changes. */
  text: string;
  /** Where in the element the reviewer clicked, as fractions of its box. */
  fx: number;
  fy: number;
};

export type ReviewAttachment = {
  /** Served at this URL by the dev server; the file is in review/uploads/. */
  url: string;
  /** The reviewer's original file name. */
  name: string;
  type: string;
  size: number;
};

export type ReviewMessage = {
  author: string;
  body: string;
  createdAt: string;
  attachments: ReviewAttachment[];
};

export type ReviewComment = ReviewMessage & {
  id: string;
  /** Page path, e.g. "/" or "/hapiko". */
  path: string;
  anchor: ReviewAnchor;
  /** The text the reviewer selected, when the comment came from a selection. */
  quote?: string;
  /**
   * "discuss": not feedback but a request for the watching Claude session
   * to start a new conversation (a T3 thread) about this spot. The session
   * replies with the thread's link and resolves it.
   */
  kind?: "comment" | "discuss";
  resolved: boolean;
  replies: ReviewMessage[];
};

/** The name Claude replies and resolves under (scripts/review-watch.ts). */
export const AGENT = "Claude";

const WEBHOOK_FILE = fileURLToPath(new URL("./webhook.json", import.meta.url));

type Webhook = { url: string; secret: string };

function readWebhook(): Webhook | undefined {
  if (!existsSync(WEBHOOK_FILE)) return undefined;
  const hook = JSON.parse(readFileSync(WEBHOOK_FILE, "utf8")) as Webhook;
  return hook.url && hook.secret ? hook : undefined;
}

/** Tell the Claude thread about a reviewer's comment. Never throws. */
async function notify(
  event: "added" | "reply" | "withdrawn" | "reopened",
  comment: ReviewComment,
  extra: Record<string, unknown>,
  log: (message: string) => void,
) {
  const hook = readWebhook();
  if (!hook) return;
  const last = comment.replies.at(-1);
  const files = (event === "reply" ? last?.attachments : comment.attachments)
    ?.map((a) => uploadPath(a.url))
    .join("\n");
  const payload = JSON.stringify({
    deliveryId: randomUUID(),
    event,
    id: comment.id,
    kind: comment.kind ?? "comment",
    path: comment.path,
    author: event === "reply" ? last?.author : comment.author,
    quote: comment.quote ?? "",
    body: event === "reply" ? (last?.body ?? "") : comment.body,
    original: event === "reply" ? comment.body : "",
    attachments: files ?? "",
    anchorText: comment.anchor.text,
    ...extra,
  });
  const signature = createHmac("sha256", hook.secret)
    .update(payload)
    .digest("hex");
  try {
    const res = await fetch(hook.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-review-signature": `sha256=${signature}`,
      },
      body: payload,
    });
    if (!res.ok) log(`[review] webhook answered ${res.status}`);
  } catch (error) {
    log(`[review] webhook failed: ${String(error)}`);
  }
}

export function readComments(): ReviewComment[] {
  if (!existsSync(COMMENTS_FILE)) return [];
  const comments = JSON.parse(
    readFileSync(COMMENTS_FILE, "utf8"),
  ) as ReviewComment[];
  // Comments saved before attachments existed.
  for (const c of comments) {
    c.attachments ??= [];
    for (const r of c.replies) r.attachments ??= [];
  }
  return comments;
}

function writeComments(comments: ReviewComment[]) {
  const tmp = `${COMMENTS_FILE}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(comments, null, 2)}\n`);
  renameSync(tmp, COMMENTS_FILE);
}

const MAX_TEXT = 4000;

function clean(value: unknown, max = MAX_TEXT): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Where an upload's URL lives on disk. */
export function uploadPath(url: string): string {
  return join(UPLOADS_DIR, basename(decodeURIComponent(url)));
}

/** Only attachments this server handed out. */
function attachments(value: unknown): ReviewAttachment[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (a): a is ReviewAttachment =>
        !!a &&
        typeof a.url === "string" &&
        a.url.startsWith("/__review/uploads/") &&
        existsSync(uploadPath(a.url)),
    )
    .slice(0, 20)
    .map((a) => ({
      url: a.url,
      name: clean(a.name, 200),
      type: clean(a.type, 100),
      size: statSync(uploadPath(a.url)).size,
    }));
}

async function json(req: IncomingMessage): Promise<Record<string, unknown>> {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 256_000) throw new Error("Request too large");
  }
  return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
}

function send(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".svg": "image/svg+xml",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
  ".pdf": "application/pdf",
};

/** Store an upload as-is. The file name keeps the original for humans. */
async function upload(req: IncomingMessage): Promise<ReviewAttachment> {
  const name =
    decodeURIComponent(String(req.headers["x-file-name"] ?? "file"))
      .replace(/[^\w.\- ]+/g, "_")
      .slice(-120) || "file";
  const declared = Number(req.headers["content-length"] ?? 0);
  if (declared > MAX_UPLOAD) throw new Error("File too large");

  mkdirSync(UPLOADS_DIR, { recursive: true });
  const file = `${crypto.randomUUID().slice(0, 8)}-${name}`;
  const path = join(UPLOADS_DIR, file);
  let size = 0;
  await new Promise<void>((done, fail) => {
    const out = createWriteStream(path);
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_UPLOAD) {
        req.destroy();
        out.destroy();
        fail(new Error("File too large"));
      }
    });
    req.pipe(out);
    out.on("finish", done);
    out.on("error", fail);
    req.on("error", fail);
  }).catch((error) => {
    rmSync(path, { force: true });
    throw error;
  });
  return {
    url: `/__review/uploads/${encodeURIComponent(file)}`,
    name,
    type:
      String(req.headers["content-type"] ?? "") ||
      TYPES[extname(name).toLowerCase()] ||
      "application/octet-stream",
    size,
  };
}

/**
 * True for loopback, private LAN, Tailscale and link-local addresses. The
 * dev server listens on every interface (vite.config.ts), including this
 * machine's public IPv6 address, so this is what keeps it on the LAN.
 */
export function isLocalAddress(address: string | undefined): boolean {
  if (!address) return false;
  const a = address
    .toLowerCase()
    .replace(/^::ffff:/, "")
    .replace(/%.*$/, "");
  if (a === "::1") return true;
  // IPv6 unique-local (fc00::/7) and link-local (fe80::/10).
  if (/^f[cd][0-9a-f]{2}:/.test(a) || /^fe[89ab][0-9a-f]:/.test(a)) {
    return true;
  }
  const m = a.match(/^(\d+)\.(\d+)\.\d+\.\d+$/);
  if (!m) return false;
  const [x, y] = [Number(m[1]), Number(m[2])];
  return (
    x === 127 ||
    x === 10 ||
    (x === 172 && y >= 16 && y <= 31) ||
    (x === 192 && y === 168) ||
    (x === 169 && y === 254) ||
    (x === 100 && y >= 64 && y <= 127) // Tailscale (CGNAT range)
  );
}

/**
 * When a Claude session last said it's watching the comments
 * (`bun run review:watch`), and whether it can start conversations. The
 * page offers "Discuss" only while such a session is there.
 */
const watchers = { lastSeen: 0, discuss: false };
const WATCHER_TIMEOUT_MS = 30_000;

export function reviewServer(): Plugin {
  return {
    name: "tsl-review-server",
    apply: "serve",
    configureServer(server) {
      const warn = (message: string) => server.config.logger.warn(message);
      // LAN only: refuse everything (pages, assets, the review API) from
      // addresses outside our networks.
      server.middlewares.use((req, res, next) => {
        if (isLocalAddress(req.socket.remoteAddress)) return next();
        res.statusCode = 403;
        res.end("This preview is only available on our local network.");
      });

      server.middlewares.use("/__review/uploads", async (req, res) => {
        try {
          if (req.method === "POST") return send(res, 201, await upload(req));

          const file = basename(
            decodeURIComponent(new URL(req.url ?? "/", "http://l").pathname),
          );
          const path = join(UPLOADS_DIR, file);
          if (req.method !== "GET" || !file || !existsSync(path)) {
            return send(res, 404, { error: "No such file" });
          }
          const ext = extname(file).toLowerCase();
          res.statusCode = 200;
          res.setHeader(
            "Content-Type",
            TYPES[ext] ?? "application/octet-stream",
          );
          res.setHeader("Content-Length", statSync(path).size);
          // SVGs could carry script; make the browser download them.
          res.setHeader(
            "Content-Disposition",
            ext === ".svg" ? "attachment" : "inline",
          );
          res.setHeader("X-Content-Type-Options", "nosniff");
          createReadStream(path).pipe(res);
        } catch (error) {
          send(res, 500, { error: String(error) });
        }
      });

      // The watcher's heartbeat, and the page's question "is anyone there?".
      server.middlewares.use("/__review/watcher", async (req, res) => {
        if (req.method === "POST") {
          const data: Record<string, unknown> = await json(req).catch(
            () => ({}),
          );
          watchers.lastSeen = Date.now();
          watchers.discuss = data.discuss === true;
          return send(res, 200, { ok: true });
        }
        const live =
          Date.now() - watchers.lastSeen < WATCHER_TIMEOUT_MS ||
          readWebhook() !== undefined;
        send(res, 200, { watching: live, discuss: live && watchers.discuss });
      });

      server.middlewares.use("/__review/comments", async (req, res) => {
        try {
          const url = new URL(req.url ?? "/", "http://local");
          const id = url.pathname.replace(/^\/+/, "");
          const comments = readComments();

          if (req.method === "GET" && !id) {
            const path = url.searchParams.get("path");
            return send(
              res,
              200,
              path ? comments.filter((c) => c.path === path) : comments,
            );
          }

          if (req.method === "POST" && !id) {
            const data = await json(req);
            const anchor = data.anchor as Partial<ReviewAnchor> | undefined;
            const comment: ReviewComment = {
              id: crypto.randomUUID(),
              path: clean(data.path, 200) || "/",
              anchor: {
                selector: clean(anchor?.selector, 1000),
                text: clean(anchor?.text, 120),
                fx: Math.min(1, Math.max(0, Number(anchor?.fx) || 0)),
                fy: Math.min(1, Math.max(0, Number(anchor?.fy) || 0)),
              },
              ...(clean(data.quote, 2000) && {
                quote: clean(data.quote, 2000),
              }),
              ...(data.kind === "discuss" && { kind: "discuss" as const }),
              author: clean(data.author, 60) || "Anonymous",
              body: clean(data.body),
              attachments: attachments(data.attachments),
              createdAt: new Date().toISOString(),
              resolved: false,
              replies: [],
            };
            if (
              !comment.body &&
              !comment.attachments.length &&
              !(comment.kind === "discuss" && comment.quote)
            ) {
              return send(res, 400, { error: "Empty comment" });
            }
            writeComments([...comments, comment]);
            server.config.logger.info(
              `[review] ${comment.author} on ${comment.path}: ${comment.body.slice(0, 80)}` +
                (comment.attachments.length
                  ? ` (+${comment.attachments.length} file(s))`
                  : ""),
            );
            void notify("added", comment, {}, warn);
            return send(res, 201, comment);
          }

          const comment = comments.find((c) => c.id === id);
          if (!comment) return send(res, 404, { error: "No such comment" });

          if (req.method === "PATCH") {
            const data = await json(req);
            const wasResolved = comment.resolved;
            if (typeof data.resolved === "boolean") {
              comment.resolved = data.resolved;
            }
            const reply = clean(data.reply);
            const files = attachments(data.attachments);
            if (reply || files.length) {
              comment.replies.push({
                author: clean(data.author, 60) || "Anonymous",
                body: reply,
                createdAt: new Date().toISOString(),
                attachments: files,
              });
            }
            writeComments(comments);
            const byAgent = clean(data.author, 60) === AGENT;
            if (!byAgent) {
              if ((reply || files.length) && !comment.resolved) {
                void notify("reply", comment, {}, warn);
              }
              if (!wasResolved && comment.resolved) {
                void notify("withdrawn", comment, { how: "resolved" }, warn);
              }
              if (wasResolved && !comment.resolved) {
                void notify("reopened", comment, {}, warn);
              }
            }
            return send(res, 200, comment);
          }

          if (req.method === "DELETE") {
            // Attachments stay in review/uploads/: pictures are worth keeping.
            writeComments(comments.filter((c) => c !== comment));
            void notify("withdrawn", comment, { how: "deleted" }, warn);
            return send(res, 200, { ok: true });
          }

          send(res, 405, { error: "Method not allowed" });
        } catch (error) {
          send(res, 500, { error: String(error) });
        }
      });
    },
  };
}
