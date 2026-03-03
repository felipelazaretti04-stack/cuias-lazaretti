import { test, expect } from "@playwright/test";

test("Admin: login e abre listagens", async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;

  test.skip(!email || !password, "Defina E2E_ADMIN_EMAIL e E2E_ADMIN_PASSWORD");

  await page.goto("/admin/login");

await page.getByTestId("admin-email").fill(email!);
await page.getByTestId("admin-password").fill(password!);
await page.getByTestId("admin-login-submit").click();

await expect(page).toHaveURL(/\/admin/);

  await page.goto("/admin/produtos");
  await expect(page.getByRole("heading", { name: "Produtos" })).toBeVisible();

  await page.goto("/admin/categorias");
  await expect(page.getByRole("heading", { name: "Categorias" })).toBeVisible();

  await page.goto("/admin/midias");
  await expect(page.getByRole("heading", { name: "Mídias" })).toBeVisible();
});
