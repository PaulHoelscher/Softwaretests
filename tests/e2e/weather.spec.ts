import { test, expect } from "@playwright/test";

test.describe("Weather dashboard", () => {
  test("zeigt Wetterdaten fuer eingegebene Stadt an", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Wetter Dashboard" })).toBeVisible();

    const input = page.getByLabel("Stadt");
    await input.fill("Berlin");
    await page.getByRole("button", { name: "Suchen" }).click();

    const card = page.getByRole("region", { name: /Wetter fuer Berlin/i });
    await expect(card).toBeVisible();
      await expect(card.getByText(/WeatherAPI\.com|Deutschland/)).toBeVisible();
    await expect(card.getByText(/Gefuehlt/)).toBeVisible();

    const history = page.getByRole("heading", { name: "Letzte Suchen" });
    await expect(history).toBeVisible();
  });
});
