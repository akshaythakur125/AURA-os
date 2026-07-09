import { test, expect } from "@playwright/test";

test.describe("Admin Authentication", () => {
  test("shows admin gate when not authenticated", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText("Admin Access")).toBeVisible();
    await expect(page.getByText("Enter the admin code")).toBeVisible();
  });

  test("rejects invalid admin code", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForSelector('input[type="password"]');
    await page.fill('input[type="password"]', "wrong-code");
    await page.click('button:has-text("Unlock Admin Panel")');
    await expect(page.getByText("Invalid admin code")).toBeVisible();
  });
});

test.describe("Payment Verification API", () => {
  test("rejects missing fields", async ({ request }) => {
    const res = await request.post("/api/payments/verify", {
      data: {},
    });
    expect(res.status()).toBe(400);
  });

  test("rejects invalid product type", async ({ request }) => {
    const res = await request.post("/api/payments/verify", {
      data: { code: "TEST", auditId: "test-123", productType: "invalid" },
    });
    expect(res.status()).toBe(400);
  });

  test("validates unlock code format", async ({ request }) => {
    const res = await request.post("/api/payments/verify", {
      data: { code: "", auditId: "test-123", productType: "aura_report" },
    });
    const data = await res.json();
    expect(data.valid).toBe(false);
  });
});

test.describe("Create Order API", () => {
  test("rejects missing fields", async ({ request }) => {
    const res = await request.post("/api/payments/create-order", {
      data: {},
    });
    expect(res.status()).toBe(400);
  });

  test("creates order with correct amounts", async ({ request }) => {
    const res = await request.post("/api/payments/create-order", {
      data: {
        productType: "aura_report",
        auditId: "test-audit-123",
        customerName: "Test User",
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.productType).toBe("aura_report");
    expect(data.originalAmount).toBe(99);
    expect(data.finalAmount).toBe(99);
    expect(data.orderId).toBeTruthy();
  });

  test("applies offer code server-side", async ({ request }) => {
    const res = await request.post("/api/payments/create-order", {
      data: {
        productType: "dating_audit",
        auditId: "test-audit-456",
        offerCode: "EARLY50",
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.originalAmount).toBe(299);
    expect(data.discountAmount).toBe(150);
    expect(data.finalAmount).toBe(149);
    expect(data.appliedOffer).toBe("EARLY50");
  });
});
