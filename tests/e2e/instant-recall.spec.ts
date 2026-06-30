import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Instant Recall smoke flow", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Build recognition-first memory cards/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Reed-Sternberg Recognition" })).toBeVisible();

  await page.keyboard.press("/");
  const search = page.getByRole("textbox", { name: "Search", exact: true });
  await expect(search).toBeFocused();
  await search.fill("g6pd");
  await expect(page.getByRole("heading", { name: "G6PD Oxidative Stress" })).toBeVisible();

  await page.locator("body").click({ position: { x: 20, y: 20 } });
  await page.keyboard.press("f");
  await expect(
    page.getByRole("region", { name: "Recall output" }).getByText("G6PD deficiency causing oxidative hemolysis."),
  ).toBeVisible();

  await page.getByRole("tab", { name: "Import" }).click();
  await page.getByLabel("Paste JSON").fill("{");
  await page.getByRole("button", { name: "Merge" }).click();
  await expect(page.getByText("Import JSON could not be parsed.")).toBeVisible();
});

test("Instant Recall page has no automated axe violations", async ({ page }) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
