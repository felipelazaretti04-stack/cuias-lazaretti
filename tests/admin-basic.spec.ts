import { test, expect } from "@playwright/test";

test("Admin: login e abre listagens", async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;

  test.skip(!email || !password, "Defina E2E_ADMIN_EMAIL e E2E_ADMIN_PASSWORD");

  await page.goto("/admin/login");

  // acha 1º input visível (texto) + 1º password visível
  const textInput = page.locator('input:not([type="hidden"]):not([type="password"])').filter({ has: page.locator(":visible") }).first();
  const passInput = page.locator('input[type="password"]:visible').first();

  // fallback caso :visible em filter não funcione em alguns engines
  const textFallback = page.locator('input:not([type="hidden"]):not([type="password"])').first();

  await expect(textInput.or(textFallback)).toBeVisible({ timeout: 15000 });
  await (await textInput.or(textFallback)).fill(email!);

  await expect(passInput).toBeVisible({ timeout: 15000 });
  await passInput.fill(password!);

  await page.getByRole("button").filter({ hasText: /entrar|login|acessar/i }).click();

  await expect(page).toHaveURL(/\/admin/);

  await page.goto("/admin/produtos");
  await expect(page.getByRole("heading", { name: "Produtos" })).toBeVisible();

  await page.goto("/admin/categorias");
  await expect(page.getByRole("heading", { name: "Categorias" })).toBeVisible();

  await page.goto("/admin/midias");
  await expect(page.getByRole("heading", { name: "Mídias" })).toBeVisible();
});
