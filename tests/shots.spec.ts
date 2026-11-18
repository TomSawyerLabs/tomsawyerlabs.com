import { expect, test, type Page } from "@playwright/test";

// The shot list at /__shots: a phone page for taking the site's photos.
// The test server keeps its data in a scratch folder (playwright.config.ts).

test.use({ viewport: { width: 390, height: 844 } });

// A 1×1 PNG stands in for a camera photo.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/iZk9HQAAAABJRU5ErkJggg==",
  "base64",
);
const photo = (name: string) => ({ name, mimeType: "image/png", buffer: PNG });

type Api = {
  shots: { id: string; title: string }[];
  photos: { id: string; shot: string | null; project: string; by: string }[];
  skipped: string[];
};

async function api(page: Page): Promise<Api> {
  return (await (await page.request.get("/__shots/api")).json()) as Api;
}

async function mineOf(page: Page, name: string) {
  return (await api(page)).photos.filter((p) => p.by === name);
}

/** A name unique to this test run, so parallel browsers don't collide. */
function tester() {
  return `T-${test.info().project.name}-${crypto.randomUUID().slice(0, 6)}`;
}

async function open(page: Page, name: string) {
  await page.goto(`/__shots?name=${name}`);
  await expect(page.locator(".shot-title")).toBeVisible();
}

async function currentShot(page: Page, data: Api) {
  const title = await page.locator(".shot-title").textContent();
  const shot = data.shots.find((s) => s.title === title);
  expect(shot).toBeTruthy();
  return shot!;
}

test("a photo taken in the walk-through is filed against its shot", async ({
  page,
}) => {
  const name = tester();
  await open(page, name);
  const shot = await currentShot(page, await api(page));

  await page.getByLabel("Choose photos").setInputFiles(photo("a.png"));
  await expect
    .poll(() => mineOf(page, name), { timeout: 15_000 })
    .toHaveLength(1);
  await expect(page.getByText("All saved")).toBeVisible();
  await expect(page.locator(".tag.done")).toBeVisible();

  const mine = await mineOf(page, name);
  expect(mine).toHaveLength(1);
  expect(mine[0].shot).toBe(shot.id);
});

test("photos taken with no connection wait on the phone and send later", async ({
  page,
}) => {
  const name = tester();
  await open(page, name);
  const shot = await currentShot(page, await api(page));
  await page.route("**/__review/uploads", (route) => route.abort());

  await page.getByLabel("Choose photos").setInputFiles(photo("b.png"));
  await expect(page.getByText(/waiting for Wi-Fi/)).toBeVisible();

  // The phone reloads the page (or the server restarts) meanwhile.
  await page.reload();
  await expect(page.getByText(/waiting for Wi-Fi/)).toBeVisible({
    timeout: 15_000,
  });
  expect((await api(page)).photos.filter((p) => p.by === name)).toHaveLength(0);

  await page.unroute("**/__review/uploads");
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect
    .poll(() => mineOf(page, name), { timeout: 15_000 })
    .toHaveLength(1);
  await expect(page.getByText("All saved")).toBeVisible();
  const mine = await mineOf(page, name);
  expect(mine).toHaveLength(1);
  expect(mine[0].shot).toBe(shot.id);
});

test("an extra photo goes to the chosen project, and can be moved", async ({
  page,
}) => {
  const name = tester();
  await open(page, name);
  await page.getByRole("button", { name: "+ Other" }).click();
  await page.getByLabel("Project").selectOption("hyparhuts");
  await page.getByLabel("Choose photos").setInputFiles(photo("c.png"));
  await expect
    .poll(() => mineOf(page, name), { timeout: 15_000 })
    .toHaveLength(1);

  const mine = await mineOf(page, name);
  expect(mine).toMatchObject([{ shot: null, project: "hyparhuts" }]);

  await page.getByRole("button", { name: `Photo by ${name}` }).click();
  await page.getByLabel("File under").selectOption("project:bins");
  await page.getByRole("button", { name: "Save" }).click();
  await expect
    .poll(async () => (await api(page)).photos.find((p) => p.by === name))
    .toMatchObject({ shot: null, project: "bins" });
});

test("skipping a shot moves on, and it can be unskipped", async ({ page }) => {
  // A shot of its own: the other tests photograph the first open one.
  const shot = (await api(page)).shots.find((s) => s.id === "hyparshade")!;
  await open(page, tester());
  await page.getByRole("button", { name: "List" }).click();
  await page.getByRole("button", { name: new RegExp(shot.title) }).click();
  await expect(page.locator(".shot-title")).toHaveText(shot.title);

  await page.getByRole("button", { name: "Skip for good" }).click();
  await expect.poll(async () => (await api(page)).skipped).toContain(shot.id);
  await expect(page.locator(".shot-title")).not.toHaveText(shot.title);

  await page.getByRole("button", { name: "List" }).click();
  await page.getByRole("button", { name: new RegExp(shot.title) }).click();
  await page.getByRole("button", { name: "Unskip" }).click();
  await expect
    .poll(async () => (await api(page)).skipped)
    .not.toContain(shot.id);
});

test("skip for now comes back after everything else", async ({ page }) => {
  // Shots of their own: the other tests photograph the first open one.
  await open(page, tester());
  await page.getByRole("button", { name: "List" }).click();
  await page.getByRole("button", { name: /A hut folded flat/ }).click();
  await page.getByRole("button", { name: "Skip for now →" }).click();
  await expect(page.locator(".shot-title")).toHaveText("Inside a hut");
  await expect(page.locator(".shot-title")).not.toHaveText(/folded flat/);

  // Not skipped on the server: it's this phone's "later", nothing more.
  expect((await api(page)).skipped).not.toContain("hyparhuts-setup");

  // Remembered across a reload, and marked in the list.
  await page.reload();
  await page.getByRole("button", { name: "List" }).click();
  await expect(
    page.getByRole("button", { name: /A hut folded flat/ }),
  ).toContainText("skipped for now");
});
