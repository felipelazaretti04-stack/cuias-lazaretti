import { test, expect } from "@playwright/test";

test("Produtos: abre página, filtra e existe resultado (ou empty state)", async ({ page }) => {
  await page.goto("/produtos");

  await expect(page.getByRole("heading", { name: "Produtos" })).toBeVisible();

  await page.locator('input[name="q"]').fill("Cuia");
  await page.getByRole("button", { name: "Filtrar" }).click();

  // ou aparece empty state, ou aparece algum link de produto visível
  const empty = page.getByText("Nada encontrado").first();
  const anyProduct = page.locator('a[href^="/produtos/"]:visible').first();

  await expect(empty.or(anyProduct)).toBeVisible();

  // tenta limpar filtros se o link existir
  const clear = page.getByRole("link", { name: "Limpar filtros" });
  if (await clear.isVisible().catch(() => false)) {
    await clear.click();
    await expect(page).toHaveURL(/\/produtos$/);
  }
});
