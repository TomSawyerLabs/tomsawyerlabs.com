import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** Start each run with an empty review store (see playwright.config.ts). */
export default function globalSetup() {
  rmSync(join(tmpdir(), "tsl-review-tests"), { recursive: true, force: true });
}
