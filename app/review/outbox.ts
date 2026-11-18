// The review overlay's outbox. Every comment, reply, resolve and delete is
// written here first and sent from here, so nothing a reviewer writes is lost
// while the dev server is down or restarting. It lives in IndexedDB (files
// included), so it also survives the page reload Vite does when the server
// comes back. Each item carries a key the server uses to ignore repeats, so
// a send that reached the server but lost its answer is safe to retry.

import type { ReviewAnchor, ReviewAttachment } from "../../review/plugin";

const DB = "tsl-review";
const STORE = "outbox";

/** A file picked while the server was unreachable, not uploaded yet. */
/**
 * A file picked while the server was unreachable, not uploaded yet. Kept as
 * raw bytes: Safari's IndexedDB refuses to store File and Blob objects.
 */
export type PendingFile = { name: string; type: string; data: ArrayBuffer };

export type OutboxItem = {
  /** Made in the browser; the server stores it to recognise a repeat. */
  key: string;
  createdAt: string;
  /** The page it belongs to. */
  path: string;
  method: "POST" | "PATCH" | "DELETE";
  /** The comment a PATCH or DELETE is for. */
  target?: string;
  /** The JSON request body, minus files still in `files`. */
  body: {
    author?: string;
    body?: string;
    reply?: string;
    resolved?: boolean;
    anchor?: ReviewAnchor;
    quote?: string;
    kind?: "comment" | "discuss";
    attachments?: ReviewAttachment[];
    [k: string]: unknown;
  };
  /** Uploaded (and moved into body.attachments) before the item is sent. */
  files: PendingFile[];
  /** Set when the server refused it outright; it then waits to be discarded. */
  error?: string;
};

let memory: OutboxItem[] = [];

function open(): Promise<IDBDatabase | null> {
  return new Promise((done) => {
    try {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () =>
        req.result.createObjectStore(STORE, { keyPath: "key" });
      req.onsuccess = () => done(req.result);
      req.onerror = () => done(null);
    } catch {
      done(null);
    }
  });
}

/** Run one request against the store; falls back to memory without IDB. */
async function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
  fallback: () => T,
): Promise<T> {
  const db = await open();
  if (!db) return fallback();
  return new Promise((done, fail) => {
    const req = run(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => done(req.result);
    req.onerror = () => fail(req.error);
  }).finally(() => db.close()) as Promise<T>;
}

export async function list(): Promise<OutboxItem[]> {
  const items = await tx<OutboxItem[]>(
    "readonly",
    (s) => s.getAll(),
    () => [...memory],
  );
  return items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function put(item: OutboxItem): Promise<void> {
  await tx(
    "readwrite",
    (s) => s.put(item),
    () => {
      memory = [...memory.filter((m) => m.key !== item.key), item];
      return item.key;
    },
  );
}

export async function remove(key: string): Promise<void> {
  await tx(
    "readwrite",
    (s) => s.delete(key),
    () => {
      memory = memory.filter((m) => m.key !== key);
      return undefined;
    },
  );
}

/**
 * A random key. Not crypto.randomUUID(): that exists only in secure
 * contexts, and reviewers reach the dev server over plain http on the LAN.
 */
export function newKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function newItem(
  path: string,
  method: OutboxItem["method"],
  body: OutboxItem["body"],
  files: PendingFile[] = [],
  target?: string,
): OutboxItem {
  return {
    key: newKey(),
    createdAt: new Date().toISOString(),
    path,
    method,
    target,
    body,
    files,
  };
}

/** Upload a file as-is. Throws `Offline` when the server can't be reached. */
export async function uploadFile(
  uploads: string,
  file: PendingFile,
): Promise<ReviewAttachment> {
  let res: Response;
  try {
    res = await fetch(uploads, {
      method: "POST",
      headers: {
        "X-File-Name": encodeURIComponent(file.name),
        ...(file.type && { "Content-Type": file.type }),
      },
      body: new Blob([file.data], { type: file.type }),
    });
  } catch {
    throw new Offline();
  }
  if (res.status >= 500) throw new Offline();
  if (!res.ok) throw new Error(`Couldn't upload ${file.name}`);
  return (await res.json()) as ReviewAttachment;
}

export class Offline extends Error {
  constructor() {
    super("The review server can't be reached");
  }
}

let flushing: Promise<boolean> | null = null;

/**
 * Send everything waiting, oldest first. Resolves true when the outbox is
 * empty of sendable items, false when the server couldn't be reached (the
 * rest waits for the next try).
 */
export function flush(api: string, uploads: string): Promise<boolean> {
  flushing ??= (async () => {
    try {
      for (const item of await list()) {
        if (item.error) continue;
        try {
          while (item.files.length) {
            const uploaded = await uploadFile(uploads, item.files[0]);
            item.body.attachments = [
              ...(item.body.attachments ?? []),
              uploaded,
            ];
            item.files = item.files.slice(1);
            await put(item);
          }
          let res: Response;
          try {
            res = await fetch(item.target ? `${api}/${item.target}` : api, {
              method: item.method,
              headers: { "Content-Type": "application/json" },
              body:
                item.method === "DELETE"
                  ? undefined
                  : JSON.stringify({ ...item.body, key: item.key }),
            });
          } catch {
            throw new Offline();
          }
          if (res.status >= 500) throw new Offline();
          // Deleting or changing a comment someone already deleted: done.
          if (res.ok || (res.status === 404 && item.method !== "POST")) {
            await remove(item.key);
          } else {
            const why = (await res.json().catch(() => ({}))) as {
              error?: string;
            };
            await put({ ...item, error: why.error ?? `HTTP ${res.status}` });
          }
        } catch (error) {
          if (error instanceof Offline) return false;
          await put({ ...item, error: String((error as Error).message) });
        }
      }
      return true;
    } finally {
      flushing = null;
    }
  })();
  return flushing;
}
