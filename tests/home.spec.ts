import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has its title, name and social cards", async ({ page }) => {
    await expect(page).toHaveTitle("Tom Sawyer Labs");
    await expect(
      page.getByRole("link", { name: "Tom Sawyer Labs, home" }),
    ).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://tomsawyerlabs.com/",
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
  });

  test("the fence shrinks into the top bar as you scroll", async ({ page }) => {
    const fence = page.locator("header.fence");
    const tall = (await fence.boundingBox())!.height;
    expect(tall).toBeGreaterThan(400);

    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
    await expect(fence).toHaveAttribute("data-collapsed", "");
    expect((await fence.boundingBox())!.height).toBeLessThan(100);
  });

  test("lists projects that link to their pages", async ({ page }) => {
    await page.getByRole("link", { name: /pFMS/ }).first().click();
    await expect(page).toHaveURL(/\/pfms$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("pFMS");
  });

  test("never uses title= tooltips", async ({ page }) => {
    await expect(page.locator("[title]")).toHaveCount(0);
  });
});

test.describe("Without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the hero is a normal block and the projects still show", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("header.fence")).toHaveCSS(
      "position",
      "relative",
    );
    await expect(
      page.getByRole("heading", { name: "What we build" }),
    ).toBeVisible();
  });
});

test.describe("404 page", () => {
  test("shows not found with a link home", async ({ page }) => {
    await page.goto("/nonexistent-page");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("404");
    await expect(
      page.getByRole("link", { name: "Go back home" }),
    ).toHaveAttribute("href", "/");
  });
});
