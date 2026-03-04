import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has title", async ({ page }) => {
    await expect(page).toHaveTitle("Tom Sawyer Labs");
  });

  test("has heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Home of our Open Source projects" }),
    ).toBeVisible();
  });

  test("has GitHub link", async ({ page }) => {
    const link = page.getByRole("link", { name: "GitHub" });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute(
      "href",
      "https://github.com/TomSawyerLabs",
    );
  });

  test("has Facebook link", async ({ page }) => {
    const link = page.getByRole("link", { name: "Facebook" });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute(
      "href",
      "https://facebook.com/TomSawyerLabs",
    );
  });

  test("has meta description", async ({ page }) => {
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute(
      "content",
      "Home of our Open Source projects.",
    );
  });

  test("has social links navigation", async ({ page }) => {
    await expect(
      page.getByRole("navigation", { name: "Social links" }),
    ).toBeVisible();
  });
});
