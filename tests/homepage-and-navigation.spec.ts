import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/AuraCheck/);
  });

  test("renders main content sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Find Your Biggest Status Leak")).toBeVisible();
    await expect(page.getByText("Start Aura Check")).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("can navigate to audit creation", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/audit/new"]');
    await expect(page).toHaveURL(/\/audit\/new/);
  });

  test("can navigate to pricing", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/pricing"]');
    await expect(page).toHaveURL(/\/pricing/);
  });

  test("can navigate to privacy center", async ({ page }) => {
    await page.goto("/privacy-center");
    await expect(page.getByText("Privacy Center")).toBeVisible();
    await expect(page.getByText("What stays in your browser")).toBeVisible();
  });
});

test.describe("Security Headers", () => {
  test("sets X-Frame-Options to DENY", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["x-frame-options"]).toBe("DENY");
  });

  test("sets X-Content-Type-Options to nosniff", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  });

  test("sets Referrer-Policy", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["referrer-policy"]).toBeTruthy();
  });
});
