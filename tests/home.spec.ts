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
    // It slides up behind its own clip rather than resizing, so what's left
    // on screen is the part above its bottom edge.
    await expect
      .poll(async () => {
        const bar = (await fence.boundingBox())!;
        return bar.y + bar.height;
      })
      .toBeLessThan(100);

    // The name ends up in the bar's left corner.
    const brand = (await page.locator(".fence__brand").boundingBox())!;
    expect(brand.x).toBeLessThan(40);
    expect(brand.y).toBeGreaterThanOrEqual(0);
    expect(brand.y + brand.height).toBeLessThan(80);
  });

  test("the fence reaches the left edge on very wide screens", async ({
    page,
  }) => {
    // Eight page loads, some at 7680 px wide: about 30 s on a busy machine.
    test.slow();
    for (const width of [1280, 3440, 5120, 7680]) {
      await page.setViewportSize({ width, height: 1440 });
      for (const path of ["/", "/practice-field"]) {
        await page.goto(path);
        const left = await page
          .locator(".picket")
          .first()
          .evaluate((el) => el.getBoundingClientRect().left);
        expect(left, `${path} at ${width}px`).toBeLessThanOrEqual(0);
      }
    }
  });

  test("lists projects that link to their pages", async ({ page }) => {
    await page.getByRole("link", { name: /pFMS/ }).first().click();
    await expect(page).toHaveURL(/\/pfms$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("pFMS");
  });

  test("the logo still draws after client-side navigation", async ({
    page,
    browserName,
  }) => {
    // The logo's paths are server-rendered only (app/components/Logo.tsx),
    // so a client-side page change must keep them. Returns the drawn logo's
    // width, or 0 if it's missing or (not in Firefox) spills out of its box.
    // Firefox draws it right but sometimes reports a <use>'s client rect
    // without the symbol's viewBox offset, so there only the width counts.
    const drawn = () =>
      page
        .locator(".fence__brand .fence__logo svg")
        .last()
        .evaluate((svg, checkBox) => {
          const box = svg.getBoundingClientRect();
          const ink = svg.querySelector("use")!.getBoundingClientRect();
          const inside =
            ink.left >= box.left - 1 &&
            ink.top >= box.top - 1 &&
            ink.right <= box.right + 1 &&
            ink.bottom <= box.bottom + 1;
          return inside || !checkBox ? ink.width : 0;
        }, browserName !== "firefox");
    const card = page.getByRole("link", { name: /pFMS/ }).first();

    await expect.poll(drawn).toBeGreaterThan(0);
    // Hydrated once React has attached itself to the card's link.
    await expect
      .poll(() =>
        card.evaluate((a) =>
          Object.keys(a).some((k) => k.startsWith("__reactFiber")),
        ),
      )
      .toBe(true);
    await page.evaluate(() => ((window as any).__samePage = true));

    await card.click();
    await expect(page).toHaveURL(/\/pfms$/);
    expect(await page.evaluate(() => (window as any).__samePage)).toBe(true);
    await expect.poll(drawn).toBeGreaterThan(0);

    await page.getByRole("link", { name: "Tom Sawyer Labs, home" }).click();
    await expect(page).toHaveURL(/\/$/);
    expect(await page.evaluate(() => (window as any).__samePage)).toBe(true);
    await expect.poll(drawn).toBeGreaterThan(0);
  });

  test("never uses title= tooltips", async ({ page }) => {
    await expect(page.locator("[title]")).toHaveCount(0);
  });
});

test.describe("Without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the hero shrinks on CSS alone where it can, else stays a block", async ({
    page,
  }) => {
    await page.goto("/");
    // The page's own scripts are off; Playwright's evaluate still runs.
    const scrollDriven = await page.evaluate(() =>
      CSS.supports("animation-timeline: scroll()"),
    );
    const fence = page.locator("header.fence");
    await expect(fence).toHaveCSS(
      "position",
      scrollDriven ? "fixed" : "relative",
    );
    if (scrollDriven) {
      await page.mouse.wheel(0, 2000);
      await expect
        .poll(async () => {
          const bar = (await fence.boundingBox())!;
          return bar.y + bar.height;
        })
        .toBeLessThan(100);
    }
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

test.describe("Background glow", () => {
  test("fades in past the fence and follows the mouse", async ({ page }) => {
    await page.goto("/");
    const glow = page.locator(".glow");
    const spot = page.locator(".glow i").first();
    await expect(glow).toBeAttached();
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await expect
      .poll(() => glow.evaluate((el) => Number(getComputedStyle(el).opacity)))
      .toBeGreaterThan(0.9);
    // Keep moving until hydration has hooked up the pointer listener.
    let x = 900;
    await expect(async () => {
      await page.mouse.move((x += 7), 600);
      await expect(spot).toHaveCSS("transform", /matrix/, { timeout: 500 });
    }).toPass();
  });

  test("stays still for reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.mouse.move(900, 600);
    await page.mouse.move(100, 100);
    await expect(page.locator(".glow i").first()).toHaveCSS(
      "transform",
      "none",
    );
  });
});
