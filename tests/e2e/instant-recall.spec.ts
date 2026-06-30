import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test("Instant Recall smoke flow", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Reed-Sternberg Recognition" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dashboard" }).first()).toBeVisible();

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

test("section navigation and top search select real destinations", async ({ page }) => {
  await page.getByRole("button", { name: "Analytics" }).first().click();
  await expect(page.getByRole("heading", { name: "Analytics" }).first()).toBeVisible();
  await expect(page.getByText(/Prototype analytics derived from deck composition/i)).toBeVisible();

  const commandSearch = page.getByRole("combobox", { name: "Search cards, concepts, tags" });
  await commandSearch.fill("g6pd");
  await page.getByRole("region", { name: "Command search results" }).getByRole("button", { name: /G6PD Oxidative Stress/i }).click();

  await expect(page.getByRole("heading", { name: "G6PD Oxidative Stress" })).toBeVisible();

  await commandSearch.fill("import");
  await page.getByRole("region", { name: "Command search results" }).getByRole("button", { name: /Import from Text/i }).click();
  await expect(page.getByRole("heading", { name: "Import from Text" })).toBeVisible();
});

test("local persistence survives reload and zero-result filters are honest", async ({ page }) => {
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Title").fill("Persisted E2E Card Title");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Persisted E2E Card Title" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Persisted E2E Card Title" })).toBeVisible();

  await page.keyboard.press("/");
  await page.getByRole("textbox", { name: "Search", exact: true }).fill("definitely-not-a-card");
  await expect(page.getByText("No cards match", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Persisted E2E Card Title" })).not.toBeVisible();
});

test("print bookmark export controls are accurately labeled and functional", async ({ page }) => {
  await page.evaluate(() => {
    window.print = () => {
      window.sessionStorage.setItem("stepspark.printed", "true");
    };
  });

  await page.getByRole("button", { name: "Bookmark", exact: true }).click();
  await expect(page.getByRole("button", { name: "Bookmarked", exact: true })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Print", exact: true }).click();
  await expect.poll(async () => page.evaluate(() => window.sessionStorage.getItem("stepspark.printed"))).toBe("true");

  await page.getByRole("tab", { name: "Import" }).click();
  await expect(page.getByRole("button", { name: "Export JSON", exact: true })).toBeVisible();
});

test("Instant Recall page has no automated axe violations", async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
