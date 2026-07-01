import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test("Instant Recall smoke flow", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Reed-Sternberg Recognition" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Today" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /Inspect the histology image/i })).toBeVisible();
  await expect(page.getByRole("region", { name: "Clinical scenario" })).toBeVisible();
  await expect(page.getByRole("button", { name: "View full image" })).toBeVisible();

  await page.getByRole("button", { name: "Library" }).first().click();
  const search = page.getByRole("textbox", { name: "Search", exact: true });
  await search.fill("g6pd");
  await expect(page.getByRole("heading", { name: "G6PD Oxidative Stress" })).toBeVisible();

  await page.locator("body").click({ position: { x: 20, y: 20 } });
  await page.keyboard.press("f");
  await expect(
    page.getByRole("region", { name: "Recall output" }).getByText("G6PD deficiency causing oxidative hemolysis."),
  ).toBeVisible();

  const commandSearch = page.getByRole("combobox", { name: "Search cards, concepts, tags" });
  await commandSearch.fill("import");
  await page.getByRole("region", { name: "Command search results" }).getByRole("button", { name: /Import Deck/i }).click();
  await page.getByLabel("Paste JSON").fill("{");
  await page.getByRole("button", { name: "Merge" }).click();
  await expect(page.getByText("Import JSON could not be parsed.")).toBeVisible();
});

test("visual media is readable and opens an accessible enlarged view", async ({ page }) => {
  const image = page.getByAltText("Medical visual recognition asset for this card");
  await expect(image).toHaveCSS("object-fit", "contain");

  await page.getByRole("button", { name: "View full image" }).click();
  const dialog = page.getByRole("dialog", { name: "Visual recognition anchor" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Source", { exact: true })).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("button", { name: "View full image" })).toBeFocused();
});

test("visual media failure keeps task, metadata, and full-image fallback usable", async ({ page }) => {
  await page.route("**/Reed-sternberg_cell.jpg", (route) => route.abort());
  await page.reload();

  await expect(page.getByRole("heading", { name: /Inspect the histology image/i })).toBeVisible();
  await expect(page.getByText("Visual asset unavailable").first()).toBeVisible();
  await expect(page.getByText(/Source: National Cancer Institute via Wikimedia Commons/i)).toBeVisible();

  await page.getByRole("button", { name: "View full image" }).click();
  const dialog = page.getByRole("dialog", { name: "Visual recognition anchor" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Visual asset unavailable")).toBeVisible();
  await expect(dialog.getByText("License", { exact: true })).toBeVisible();
});

test("arrow keys navigate cards but not while typing", async ({ page }) => {
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("heading", { name: "G6PD Oxidative Stress" })).toBeVisible();

  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("heading", { name: "Reed-Sternberg Recognition" })).toBeVisible();

  await page.getByLabel("Temporary prediction note").fill("my prediction");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("heading", { name: "Reed-Sternberg Recognition" })).toBeVisible();
});

test("dashboard actions connect the main app sections", async ({ page }) => {
  await page.getByRole("button", { name: "Start Review" }).click();
  await expect(page.getByRole("heading", { name: "Review" })).toBeVisible();

  await page.getByRole("button", { name: "Today" }).first().click();
  await page.getByRole("button", { name: "Browse Library" }).click();
  await expect(page.getByRole("heading", { name: "Library" })).toBeVisible();

  await page.getByRole("button", { name: /G6PD Oxidative Stress/i }).first().click();
  await expect(page.getByRole("heading", { name: "Library" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "G6PD Oxidative Stress" })).toBeVisible();
  await expect.poll(async () => page.evaluate(() => document.activeElement?.textContent?.includes("G6PD Oxidative Stress") ?? false)).toBe(true);

  await page.getByRole("button", { name: "Today" }).first().click();
  await page.getByRole("region", { name: "Today's StepSpark Mission" }).getByRole("button", { name: /Create Card/i }).click();
  await expect(page.getByRole("heading", { name: "Card Editor" })).toBeVisible();
  await expect(page.getByLabel("Task prompt")).toBeVisible();

  await page.getByRole("button", { name: "Today" }).first().click();
  await page.getByRole("region", { name: "Today's StepSpark Mission" }).getByRole("button", { name: /Import Deck/i }).click();
  await expect(page.getByRole("heading", { name: "Import from Text" })).toBeVisible();
});

test("mobile learning flow starts with task, visual, scenario, and reveal", async ({ page }) => {
  const taskBox = await page.getByRole("heading", { name: /Inspect the histology image/i }).boundingBox();
  const imageBox = await page.getByAltText("Medical visual recognition asset for this card").boundingBox();
  const scenarioBox = await page.getByRole("region", { name: "Clinical scenario" }).boundingBox();
  const revealBox = await page.getByRole("button", { name: "Reveal answer" }).boundingBox();

  expect(taskBox?.y).toBeLessThan(imageBox?.y ?? Number.POSITIVE_INFINITY);
  expect(imageBox?.y).toBeLessThan(scenarioBox?.y ?? Number.POSITIVE_INFINITY);
  expect(scenarioBox?.y).toBeLessThan(revealBox?.y ?? Number.POSITIVE_INFINITY);
});

test("section navigation and top search select real destinations", async ({ page }) => {
  await page.getByRole("button", { name: "Progress" }).first().click();
  await expect(page.getByRole("heading", { name: "Progress" }).first()).toBeVisible();
  await expect(page.getByText(/Prototype analytics derived from deck composition/i)).toBeVisible();

  const commandSearch = page.getByRole("combobox", { name: "Search cards, concepts, tags" });
  await commandSearch.fill("g6pd");
  await page.getByRole("region", { name: "Command search results" }).getByRole("button", { name: /G6PD Oxidative Stress/i }).click();

  await expect(page.getByRole("heading", { name: "G6PD Oxidative Stress" })).toBeVisible();

  await commandSearch.fill("import");
  await page.getByRole("region", { name: "Command search results" }).getByRole("button", { name: /Import Deck/i }).click();
  await expect(page.getByRole("heading", { name: "Import from Text" })).toBeVisible();
});

test("local persistence survives reload and zero-result filters are honest", async ({ page }) => {
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Title").fill("Persisted E2E Card Title");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Persisted E2E Card Title" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Persisted E2E Card Title" })).toBeVisible();

  await page.getByRole("button", { name: "Library" }).first().click();
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
