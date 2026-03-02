import { test, expect } from "@playwright/test";

test("Home: seção Destaques aparece e tem produto clicável (visível)", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Destaques da semana")).toBeVisible();

  // pega qualquer link de produto visível (não só o primeiro no DOM)
  const visibleProductLink = page.locator('a[href^="/produtos/"]:visible').first();
  await expect(visibleProductLink).toBeVisible();
});
