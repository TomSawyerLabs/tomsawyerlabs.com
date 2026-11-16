import { expect, test, type Page } from "@playwright/test";

// Review mode keeps what a reviewer writes while the server is unreachable
// and sends it when it's back. The dev server for the tests keeps comments in
// a scratch folder (REVIEW_DIR in playwright.config.ts).

const API = "**/__review/comments**";

// Each test and browser gets a page of its own, so pins left by the others
// can't cover the spot it clicks. (global-setup.ts empties the store.)
const PAGES = [
  "pfms",
  "clearance",
  "punchlist",
  "bins",
  "mcu-hil",
  "hil-runner",
  "bootbob",
  "benchbob",
  "practice-field",
];
const TESTS = ["offline", "lost", "draft"];
const BROWSERS = ["chromium", "firefox", "webkit"];

function pageFor(which: string) {
  const i =
    TESTS.indexOf(which) * BROWSERS.length +
    BROWSERS.indexOf(test.info().project.name);
  return `/${PAGES[i]}`;
}

async function openPanel(page: Page, which: string) {
  await page.goto(`${pageFor(which)}?reviewer=Tester`);
  await page.getByRole("button", { name: /Review/ }).click();
  await expect(page.getByText("+ Add a comment")).toBeVisible();
}

async function writeComment(page: Page, text: string) {
  await page.getByText("+ Add a comment").click();
  // Fold the panel away so it can't cover the spot being picked.
  await page.getByRole("button", { name: /Review/ }).click();
  await page.getByRole("heading", { level: 1 }).click();
  await page
    .getByPlaceholder("What should change here? Drop or paste pictures too.")
    .fill(text);
}

async function countOnServer(page: Page, text: string) {
  const res = await page.request.get("/__review/comments");
  const all = (await res.json()) as { body: string }[];
  return all.filter((c) => c.body === text).length;
}

test("a comment written while the server is down sends when it's back", async ({
  page,
}) => {
  const text = `offline ${crypto.randomUUID()}`;
  await openPanel(page, "offline");
  await page.route(API, (route) => route.abort());

  await writeComment(page, text);
  await page.getByRole("button", { name: "Comment", exact: true }).click();
  await page.getByRole("button", { name: /Review/ }).click();
  await expect(page.getByText("Waiting to send")).toBeVisible();
  await expect(page.getByText(/Can't reach the review server/)).toBeVisible();

  // Vite reloads the page when the server comes back; it must survive that.
  await page.reload();
  await page.getByRole("button", { name: /Review/ }).click();
  await expect(page.getByText(`Comment: ${text}`)).toBeVisible();
  expect(await countOnServer(page, text)).toBe(0);

  await page.unroute(API);
  await expect(page.getByText("Waiting to send")).toBeHidden({
    timeout: 15_000,
  });
  await expect(page.getByText(`Tester ${text}`)).toBeVisible();
  expect(await countOnServer(page, text)).toBe(1);
});

test("a send whose answer is lost is not posted twice", async ({ page }) => {
  const text = `lost answer ${crypto.randomUUID()}`;
  await openPanel(page, "lost");
  // The first POST reaches the server, but the browser never hears back.
  let first = true;
  await page.route(API, async (route) => {
    if (first && route.request().method() === "POST") {
      first = false;
      await route.fetch();
      return route.abort();
    }
    return route.continue();
  });

  await writeComment(page, text);
  await page.getByRole("button", { name: "Comment", exact: true }).click();
  await page.getByRole("button", { name: /Review/ }).click();
  await expect(page.getByText(`Tester ${text}`)).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText("Waiting to send")).toBeHidden();
  expect(await countOnServer(page, text)).toBe(1);
});

test("a half-written comment survives a reload", async ({ page }) => {
  const text = `draft ${crypto.randomUUID()}`;
  await openPanel(page, "draft");
  await writeComment(page, text);
  await page.reload();
  await expect(
    page.getByPlaceholder(
      "What should change here? Drop or paste pictures too.",
    ),
  ).toHaveValue(text);
});
