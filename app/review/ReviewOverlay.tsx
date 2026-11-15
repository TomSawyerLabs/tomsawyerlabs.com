// Review mode: pin comments to the live page. Loaded only by the dev server
// (see app/root.tsx); the API is review/plugin.ts. Nothing here ships in a
// build.
//
// Reviewers open the site with ?reviewer=Name once; the name is remembered.

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import type {
  ReviewAnchor,
  ReviewAttachment,
  ReviewComment,
} from "../../review/plugin";

const API = "/__review/comments";
const UPLOADS = "/__review/uploads";
const WATCHER = "/__review/watcher";
const NAME_KEY = "tsl-review-name";
const POLL_MS = 5000;

function storedName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}
function storeName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    // Private mode: the name just won't be remembered.
  }
}

/** A selector for `el`: the nearest id-bearing ancestor, then nth-of-type. */
function selectorFor(el: Element): string {
  const parts: string[] = [];
  let node: Element | null = el;
  while (node && node !== document.body) {
    if (node.id && !node.closest("[data-review-ui]")) {
      parts.unshift(`[id="${CSS.escape(node.id)}"]`);
      break;
    }
    const tag = node.tagName.toLowerCase();
    const parent: Element | null = node.parentElement;
    if (!parent) break;
    const same = [...parent.children].filter(
      (c) => c.tagName === node!.tagName,
    );
    parts.unshift(
      same.length > 1 ? `${tag}:nth-of-type(${same.indexOf(node) + 1})` : tag,
    );
    node = parent;
  }
  return parts.join(" > ");
}

function textOf(el: Element): string {
  return (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 120);
}

/** Find the anchored element again: by selector, else by its text. */
function resolve(anchor: ReviewAnchor): Element | null {
  try {
    const el = anchor.selector ? document.querySelector(anchor.selector) : null;
    if (el && (!anchor.text || textOf(el).startsWith(anchor.text.slice(0, 30))))
      return el;
  } catch {
    // An invalid selector (the page changed); fall back to text.
  }
  if (!anchor.text) return null;
  const all = document.querySelectorAll("main *");
  for (const el of all) {
    if (textOf(el) === anchor.text) return el;
  }
  return null;
}

type Point = { x: number; y: number };

function pinPoint(c: ReviewComment): Point | null {
  const el = resolve(c.anchor);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (!r.width && !r.height) return null;
  return {
    x: r.left + window.scrollX + r.width * c.anchor.fx,
    y: r.top + window.scrollY + r.height * c.anchor.fy,
  };
}

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export default function ReviewOverlay() {
  const { pathname } = useLocation();
  const [name, setName] = useState("");
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [panel, setPanel] = useState(false);
  const [picking, setPicking] = useState(false);
  const [draft, setDraft] = useState<{
    anchor: ReviewAnchor;
    at: Point;
    quote?: string;
  } | null>(null);
  // Selected text on the page: offer to comment on exactly that.
  const [selection, setSelection] = useState<{
    anchor: ReviewAnchor;
    at: Point;
    quote: string;
  } | null>(null);

  useEffect(() => {
    function read() {
      const sel = document.getSelection();
      const quote = sel?.toString().replace(/\s+/g, " ").trim() ?? "";
      if (!sel || sel.isCollapsed || !quote || !sel.rangeCount) {
        setSelection(null);
        return;
      }
      const range = sel.getRangeAt(0);
      const node = range.commonAncestorContainer;
      const el = node instanceof Element ? node : node.parentElement;
      if (
        !el ||
        el.closest("[data-review-ui]") ||
        !el.closest("main, header")
      ) {
        setSelection(null);
        return;
      }
      const end = range.getClientRects();
      const last = end[end.length - 1] ?? range.getBoundingClientRect();
      const box = el.getBoundingClientRect();
      setSelection({
        quote: quote.slice(0, 2000),
        anchor: {
          selector: selectorFor(el),
          text: textOf(el),
          fx: box.width ? (last.right - box.left) / box.width : 0,
          fy: box.height ? (last.bottom - box.top) / box.height : 0,
        },
        at: { x: last.right + window.scrollX, y: last.top + window.scrollY },
      });
    }
    // Read once the pointer is up (no flicker mid-drag), and on keyboard or
    // touch selection changes.
    let timer = 0;
    function later() {
      clearTimeout(timer);
      timer = window.setTimeout(read, 120);
    }
    document.addEventListener("pointerup", later);
    document.addEventListener("keyup", later);
    document.addEventListener("selectionchange", later);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("pointerup", later);
      document.removeEventListener("keyup", later);
      document.removeEventListener("selectionchange", later);
    };
  }, []);
  const [open, setOpen] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);
  const [, setLayout] = useState(0);
  const hover = useRef<HTMLDivElement>(null);

  // Name: ?reviewer=Name wins, then the remembered one.
  useEffect(() => {
    const fromUrl = new URLSearchParams(location.search).get("reviewer");
    if (fromUrl) storeName(fromUrl);
    setName(fromUrl || storedName());
  }, []);

  const load = useCallback(async () => {
    const res = await fetch(`${API}?path=${encodeURIComponent(pathname)}`);
    if (res.ok) setComments(await res.json());
  }, [pathname]);

  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  // Re-place pins when the layout moves.
  useEffect(() => {
    const bump = () => setLayout((n) => n + 1);
    window.addEventListener("resize", bump);
    const timer = setInterval(bump, 1000);
    return () => {
      window.removeEventListener("resize", bump);
      clearInterval(timer);
    };
  }, []);

  // Pick mode: outline what's under the pointer; a click pins a draft there.
  useEffect(() => {
    if (!picking) return;
    const isUi = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest("[data-review-ui]");
    function onMove(e: PointerEvent) {
      const box = hover.current;
      if (!box) return;
      if (isUi(e.target) || !(e.target instanceof Element)) {
        box.style.display = "none";
        return;
      }
      const r = e.target.getBoundingClientRect();
      Object.assign(box.style, {
        display: "block",
        left: `${r.left}px`,
        top: `${r.top}px`,
        width: `${r.width}px`,
        height: `${r.height}px`,
      });
    }
    function onClick(e: MouseEvent) {
      if (isUi(e.target) || !(e.target instanceof Element)) return;
      e.preventDefault();
      e.stopPropagation();
      const el = e.target;
      const r = el.getBoundingClientRect();
      setDraft({
        anchor: {
          selector: selectorFor(el),
          text: textOf(el),
          fx: r.width ? (e.clientX - r.left) / r.width : 0,
          fy: r.height ? (e.clientY - r.top) / r.height : 0,
        },
        at: { x: e.clientX + window.scrollX, y: e.clientY + window.scrollY },
      });
      setPicking(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPicking(false);
    }
    document.addEventListener("pointermove", onMove, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey);
    document.documentElement.classList.add("review-picking");
    return () => {
      document.removeEventListener("pointermove", onMove, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("review-picking");
      if (hover.current) hover.current.style.display = "none";
    };
  }, [picking]);

  // Is a Claude session watching the comments (bun run review:watch)? If
  // it can start conversations, the draft offers "Discuss".
  const [watcher, setWatcher] = useState({ watching: false, discuss: false });
  useEffect(() => {
    let alive = true;
    async function check() {
      try {
        const res = await fetch(WATCHER);
        if (alive && res.ok) setWatcher(await res.json());
      } catch {
        // Server restarting; try again next time.
      }
    }
    check();
    const timer = setInterval(check, POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  async function save(
    text: string,
    author: string,
    files: ReviewAttachment[],
    kind: "comment" | "discuss" = "comment",
  ) {
    if (!draft) return;
    storeName(author);
    setName(author);
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        anchor: draft.anchor,
        quote: draft.quote,
        kind,
        author,
        body: text,
        attachments: files,
      }),
    });
    setDraft(null);
    load();
  }

  async function patch(id: string, data: object) {
    await fetch(`${API}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author: name, ...data }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    setOpen(null);
    load();
  }

  const visible = comments.filter((c) => showResolved || !c.resolved);
  const unresolved = comments.filter((c) => !c.resolved).length;

  return (
    <>
      <style>{STYLES}</style>
      <div ref={hover} className="rv-hover" data-review-ui />

      <div className="rv-layer" data-review-ui>
        {visible.map((c, i) => {
          const at = pinPoint(c);
          if (!at) return null;
          return (
            <div key={c.id}>
              <button
                type="button"
                className={`rv-pin${c.resolved ? " resolved" : ""}`}
                style={{ left: at.x, top: at.y }}
                onClick={() => setOpen(open === c.id ? null : c.id)}
                aria-label={`Comment ${i + 1} by ${c.author}`}
              >
                {i + 1}
              </button>
              {open === c.id && (
                <Thread
                  comment={c}
                  at={at}
                  onClose={() => setOpen(null)}
                  onReply={(reply, files) =>
                    patch(c.id, { reply, attachments: files })
                  }
                  onResolve={() => patch(c.id, { resolved: !c.resolved })}
                  onDelete={() => remove(c.id)}
                />
              )}
            </div>
          );
        })}
        {selection && !draft && (
          <button
            type="button"
            className="rv-select"
            style={{ left: selection.at.x, top: selection.at.y }}
            // Keep the selection while clicking.
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => {
              setDraft(selection);
              setSelection(null);
              document.getSelection()?.removeAllRanges();
            }}
          >
            💬 Comment
          </button>
        )}
        {draft && (
          <Draft
            at={draft.at}
            quote={draft.quote}
            name={name}
            onCancel={() => setDraft(null)}
            onSave={save}
            canDiscuss={watcher.discuss}
          />
        )}
      </div>

      <div className="rv-dock" data-review-ui>
        {panel && (
          <section className="rv-panel" aria-label="Review comments">
            <header>
              <strong>Review</strong>
              <span>{name ? `as ${name}` : "not signed in"}</span>
            </header>
            <p className="rv-watching">
              {watcher.watching
                ? watcher.discuss
                  ? "● Claude is watching: comments get worked on, and 🧵 Discuss starts a conversation."
                  : "● Claude is watching: comments get worked on."
                : "○ No Claude session is watching right now; comments wait here."}
            </p>
            <button
              type="button"
              className="rv-primary"
              onClick={() => setPicking(!picking)}
            >
              {picking
                ? "Click something on the page… (Esc)"
                : "+ Add a comment"}
            </button>
            <ol>
              {visible.map((c, i) => (
                <li key={c.id} className={c.resolved ? "resolved" : undefined}>
                  <button
                    type="button"
                    onClick={() => {
                      const at = pinPoint(c);
                      if (at)
                        window.scrollTo({
                          top: at.y - innerHeight / 2,
                          behavior: "smooth",
                        });
                      setOpen(c.id);
                    }}
                  >
                    <span className="rv-num">{i + 1}</span>
                    <span>
                      <b>{c.author}</b> {c.body.slice(0, 90)}
                      {c.replies.length > 0 && ` (+${c.replies.length})`}
                    </span>
                  </button>
                </li>
              ))}
              {visible.length === 0 && (
                <li className="rv-empty">No comments on this page yet.</li>
              )}
            </ol>
            <label className="rv-check">
              <input
                type="checkbox"
                checked={showResolved}
                onChange={(e) => setShowResolved(e.target.checked)}
              />
              Show resolved
            </label>
            <p className="rv-note">
              Review mode exists only on this preview server. Comments never
              appear on the public site.
            </p>
          </section>
        )}
        <button
          type="button"
          className="rv-toggle"
          onClick={() => setPanel(!panel)}
          aria-expanded={panel}
        >
          💬 <span className="rv-toggle-label">Review</span>
          {unresolved ? ` · ${unresolved}` : ""}
        </button>
      </div>
    </>
  );
}

/** Upload files as-is (full resolution) and track their progress. */
function useUploads() {
  const [files, setFiles] = useState<ReviewAttachment[]>([]);
  const [busy, setBusy] = useState<{ id: number; name: string; pct: number }[]>(
    [],
  );
  const [error, setError] = useState("");
  const nextId = useRef(0);

  function add(list: FileList | File[] | null) {
    for (const file of list ? [...list] : []) {
      const id = nextId.current++;
      setBusy((b) => [...b, { id, name: file.name, pct: 0 }]);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", UPLOADS);
      xhr.setRequestHeader("X-File-Name", encodeURIComponent(file.name));
      if (file.type) xhr.setRequestHeader("Content-Type", file.type);
      xhr.upload.onprogress = (e) =>
        setBusy((b) =>
          b.map((x) =>
            x.id === id
              ? {
                  ...x,
                  pct: e.total ? Math.round((100 * e.loaded) / e.total) : 0,
                }
              : x,
          ),
        );
      xhr.onloadend = () => {
        setBusy((b) => b.filter((x) => x.id !== id));
        if (xhr.status === 201) {
          setFiles((f) => [...f, JSON.parse(xhr.responseText)]);
        } else {
          setError(`Couldn't upload ${file.name}`);
        }
      };
      xhr.send(file);
    }
  }

  return {
    files,
    busy: busy.length > 0,
    reset: () => {
      setFiles([]);
      setError("");
    },
    remove: (url: string) => setFiles((f) => f.filter((x) => x.url !== url)),
    /** Props for a drop target that also accepts pasted pictures. */
    target: {
      onDragOver: (e: React.DragEvent) => e.preventDefault(),
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        add(e.dataTransfer.files);
      },
      onPaste: (e: React.ClipboardEvent) => {
        if (e.clipboardData.files.length) {
          e.preventDefault();
          add(e.clipboardData.files);
        }
      },
    },
    picker: (
      <label className="rv-attach">
        📎 Attach
        <input
          type="file"
          multiple
          accept="image/*,.heic,.heif,.pdf,.tif,.tiff"
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
    ),
    status: (
      <>
        {busy.map((b) => (
          <div key={b.id} className="rv-progress">
            Uploading {b.name}… {b.pct}%
          </div>
        ))}
        {error && <div className="rv-error">{error}</div>}
      </>
    ),
  };
}

/** Browsers can't show these inline; link to the original instead. */
const NO_PREVIEW = /hei[cf]|tiff|pdf/;

function Attachments({
  files,
  onRemove,
}: {
  files: ReviewAttachment[];
  onRemove?: (url: string) => void;
}) {
  if (!files.length) return null;
  return (
    <ul className="rv-files">
      {files.map((f) => (
        <li key={f.url}>
          <a href={f.url} target="_blank" rel="noreferrer">
            {f.type.startsWith("image/") && !NO_PREVIEW.test(f.type) ? (
              <img src={f.url} alt={f.name} loading="lazy" />
            ) : (
              <span className="rv-file-icon">
                {f.name.split(".").pop()?.toUpperCase()}
              </span>
            )}
            <span className="rv-file-name">
              {f.name} · {(f.size / 1e6).toFixed(1)} MB
            </span>
          </a>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(f.url)}
              aria-label={`Remove ${f.name}`}
            >
              ×
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

function Draft({
  at,
  quote,
  name,
  onCancel,
  onSave,
  canDiscuss,
}: {
  at: Point;
  quote?: string;
  name: string;
  onCancel: () => void;
  onSave: (
    text: string,
    author: string,
    files: ReviewAttachment[],
    kind?: "comment" | "discuss",
  ) => void;
  /** A Claude session that can start conversations is watching. */
  canDiscuss?: boolean;
}) {
  const [text, setText] = useState("");
  const [author, setAuthor] = useState(name);
  const uploads = useUploads();
  return (
    <form
      className="rv-card"
      style={{ left: at.x, top: at.y }}
      {...uploads.target}
      onSubmit={(e) => {
        e.preventDefault();
        if (
          (text.trim() || uploads.files.length) &&
          author.trim() &&
          !uploads.busy
        )
          onSave(text, author.trim(), uploads.files);
      }}
    >
      {quote && <blockquote className="rv-quote">{quote}</blockquote>}
      {!name && (
        <input
          placeholder="Your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
      )}
      <textarea
        autoFocus
        rows={4}
        placeholder="What should change here? Drop or paste pictures too."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
            e.currentTarget.form?.requestSubmit();
          if (e.key === "Escape") onCancel();
        }}
      />
      <Attachments files={uploads.files} onRemove={uploads.remove} />
      {uploads.status}
      <div className="rv-actions">
        {uploads.picker}
        <span className="rv-spacer" />
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        {canDiscuss && (
          <button
            type="button"
            disabled={uploads.busy || !author.trim() || !(text.trim() || quote)}
            onClick={() =>
              onSave(text, author.trim(), uploads.files, "discuss")
            }
          >
            🧵 Discuss
          </button>
        )}
        <button type="submit" className="rv-primary" disabled={uploads.busy}>
          Comment
        </button>
      </div>
      {canDiscuss && (
        <p className="rv-hint">
          🧵 Discuss starts a separate conversation with Claude about this spot;
          you'll get its link here.
        </p>
      )}
    </form>
  );
}

function Thread({
  comment,
  at,
  onClose,
  onReply,
  onResolve,
  onDelete,
}: {
  comment: ReviewComment;
  at: Point;
  onClose: () => void;
  onReply: (text: string, files: ReviewAttachment[]) => void;
  onResolve: () => void;
  onDelete: () => void;
}) {
  const [reply, setReply] = useState("");
  const uploads = useUploads();
  return (
    <div className="rv-card" style={{ left: at.x, top: at.y }}>
      <button type="button" className="rv-close" onClick={onClose}>
        ×
      </button>
      {comment.kind === "discuss" && (
        <p className="rv-badge">
          🧵{" "}
          {comment.resolved ? "Conversation started" : "Discussion requested"}
        </p>
      )}
      {comment.quote && (
        <blockquote className="rv-quote">{comment.quote}</blockquote>
      )}
      {[comment, ...comment.replies].map((m, i) => (
        <div key={i} className="rv-msg">
          <div className="rv-meta">
            <b>{m.author}</b> · {when(m.createdAt)}
          </div>
          {m.body && <p>{m.body}</p>}
          <Attachments files={m.attachments ?? []} />
        </div>
      ))}
      <form
        {...uploads.target}
        onSubmit={(e) => {
          e.preventDefault();
          if ((reply.trim() || uploads.files.length) && !uploads.busy) {
            onReply(reply, uploads.files);
            setReply("");
            uploads.reset();
          }
        }}
      >
        <textarea
          rows={2}
          placeholder="Reply (drop or paste pictures too)"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
        <Attachments files={uploads.files} onRemove={uploads.remove} />
        {uploads.status}
        <div className="rv-actions">
          {uploads.picker}
          <span className="rv-spacer" />
          <button type="button" onClick={onDelete}>
            Delete
          </button>
          <button type="button" onClick={onResolve}>
            {comment.resolved ? "Reopen" : "Resolve"}
          </button>
          <button type="submit" className="rv-primary" disabled={uploads.busy}>
            Reply
          </button>
        </div>
      </form>
    </div>
  );
}

// Styles live here, not in global.css, so they never reach a build.
const STYLES = `
@media (max-width: 700px) {
  /* Phones: a small button in the corner, out of the way of the text. */
  .rv-dock { left: auto; right: 12px; bottom: 12px; align-items: flex-end; }
  .rv-toggle-label { display: none; }
  .rv-toggle { padding: 8px 12px; }
}
.rv-watching { margin: 0; font-size: 12px; color: var(--ink-muted); }
.rv-hint { margin: 2px 0 0; font-size: 12px; color: var(--ink-muted); }
.rv-badge { margin: 0; font: 600 12px var(--font-sans); color: #f08a4b; }
.rv-select { position: absolute; translate: 6px -110%; padding: 6px 11px; border-radius: 999px;
  border: 1px solid #f08a4b; background: var(--card); color: var(--ink);
  font: 600 13px/1 var(--font-sans); cursor: pointer; box-shadow: 0 8px 24px rgba(0,0,0,.3);
  white-space: nowrap; }
.rv-select:hover { background: #f08a4b; color: #fff; }
.rv-quote { margin: 0; padding: 6px 10px; border-left: 3px solid #f08a4b; border-radius: 4px;
  background: var(--accent); color: var(--ink-muted); font-size: 13px; font-style: italic;
  max-height: 7.5em; overflow: auto; white-space: pre-wrap; }
.rv-attach { position: relative; padding: 5px 10px; border-radius: 8px; border: 1px dashed var(--ink-muted);
  font-size: 13px; cursor: pointer; color: var(--ink-muted); }
.rv-attach input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.rv-spacer { flex: 1; }
.rv-files { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(88px, 1fr)); gap: 6px; }
.rv-files li { position: relative; }
.rv-files a { display: grid; gap: 2px; text-decoration: none; color: var(--ink-muted); font-size: 11px; }
.rv-files img, .rv-file-icon { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 8px;
  border: 1px solid var(--ink-muted); background: var(--paper); display: grid; place-items: center;
  font-weight: 700; color: var(--ink-muted); }
.rv-file-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rv-files li button { position: absolute; top: 2px; right: 2px; width: 20px; height: 20px; border-radius: 999px;
  border: 0; background: rgba(0,0,0,.6); color: #fff; cursor: pointer; line-height: 1; }
.rv-progress { font-size: 12px; color: var(--ink-muted); }
.rv-error { font-size: 12px; color: #e5484d; }
.rv-actions { align-items: center; }
.review-picking, .review-picking * { cursor: crosshair !important; }
.rv-hover { position: fixed; display: none; pointer-events: none; z-index: 9998;
  outline: 2px dashed #f08a4b; outline-offset: 2px; border-radius: 4px;
  background: rgba(240,138,75,.06); }
.rv-layer { position: absolute; left: 0; top: 0; width: 0; height: 0; z-index: 9999; }
.rv-pin { position: absolute; translate: -50% -50%; width: 26px; height: 26px;
  border-radius: 999px 999px 999px 4px; border: 2px solid #fff; background: #f08a4b;
  color: #fff; font: 700 12px/1 var(--font-sans); cursor: pointer;
  box-shadow: 0 4px 14px rgba(0,0,0,.35); }
.rv-pin.resolved { background: #6b7182; opacity: .7; }
.rv-card { position: absolute; translate: 14px 14px; width: min(320px, 80vw);
  background: var(--card); color: var(--ink); border: 1px solid var(--ink-muted);
  border-radius: 12px; padding: 12px; box-shadow: 0 20px 50px rgba(0,0,0,.35);
  display: grid; gap: 8px; font: 14px/1.45 var(--font-sans); }
.rv-card textarea, .rv-card input { width: 100%; font: inherit; color: inherit;
  background: var(--paper); border: 1px solid var(--ink-muted); border-radius: 8px; padding: 8px; }
.rv-card p { margin: 0; white-space: pre-wrap; }
.rv-msg + .rv-msg { border-top: 1px solid var(--rule); padding-top: 8px; }
.rv-meta { font-size: 12px; color: var(--ink-muted); }
.rv-close { position: absolute; right: 8px; top: 4px; background: none; border: 0;
  color: var(--ink-muted); font-size: 20px; cursor: pointer; }
.rv-actions { display: flex; justify-content: flex-end; gap: 6px; margin-top: 6px; }
.rv-actions button, .rv-panel button { font: inherit; cursor: pointer; }
.rv-actions button { padding: 5px 10px; border-radius: 8px; border: 1px solid var(--ink-muted);
  background: transparent; color: var(--ink); }
.rv-primary { background: #f08a4b !important; border-color: #f08a4b !important; color: #fff !important; }
.rv-dock { position: fixed; left: 16px; bottom: 16px; z-index: 10000;
  display: flex; flex-direction: column; align-items: flex-start; gap: 8px;
  font: 14px/1.4 var(--font-sans); }
.rv-toggle { padding: 9px 14px; border-radius: 999px; border: 1px solid #f08a4b;
  background: var(--card); color: var(--ink); font-weight: 600;
  box-shadow: 0 8px 24px rgba(0,0,0,.3); }
.rv-panel { width: min(340px, calc(100vw - 32px)); max-height: 60vh; overflow: auto;
  background: var(--card); color: var(--ink); border: 1px solid var(--ink-muted);
  border-radius: 14px; padding: 12px; box-shadow: 0 20px 50px rgba(0,0,0,.35);
  display: grid; gap: 10px; }
.rv-panel header { display: flex; justify-content: space-between; align-items: baseline; }
.rv-panel header span, .rv-note, .rv-check { font-size: 12px; color: var(--ink-muted); }
.rv-panel > .rv-primary { padding: 8px; border-radius: 8px; border: 1px solid; }
.rv-panel ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.rv-panel li button { display: flex; gap: 8px; width: 100%; text-align: left; padding: 6px;
  background: none; border: 0; border-radius: 8px; color: inherit; }
.rv-panel li button:hover { background: var(--accent); }
.rv-panel li.resolved { opacity: .55; }
.rv-num { flex: none; width: 20px; height: 20px; border-radius: 999px; background: #f08a4b;
  color: #fff; display: grid; place-items: center; font-size: 11px; font-weight: 700; }
.rv-empty { color: var(--ink-muted); font-size: 13px; }
.rv-note { margin: 0; }
.rv-check { display: flex; gap: 6px; align-items: center; }
`;
