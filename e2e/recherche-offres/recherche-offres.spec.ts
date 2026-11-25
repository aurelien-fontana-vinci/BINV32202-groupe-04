import { expect, test } from "@playwright/test";

test.describe("Recherche d’offres", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173/");
    await expect(
      page.getByRole("heading", { name: "Connexion de démonstration" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Lucas Dupont" }).click();
    await page.getByRole("link", { name: "Offres", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Offres de stage" }),
    ).toBeVisible();
  });

  test("Scénario 1 : la recherche affiche uniquement l’offre publiée correspondante", async ({
    page,
  }) => {
    await page
      .getByRole("searchbox", { name: "Rechercher par titre" })
      .fill("  APPLICATION  ");

    const offerRows = page.locator("tbody tr");
    await expect(offerRows).toHaveCount(1);
    await expect(
      offerRows.getByRole("cell", {
        name: "Application React de gestion de flotte",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("table").getByText(
        "Migration d'une application vers le cloud",
        { exact: true },
      ),
    ).toHaveCount(0);
  });

  test("Scénario 2 : la recherche sans correspondance affiche l’état vide", async ({
    page,
  }) => {
    await page
      .getByRole("searchbox", { name: "Rechercher par titre" })
      .fill("stage introuvable 9x7q");

    await expect(page.locator("tbody tr")).toHaveCount(0);
    await expect(
      page.getByText("Aucune offre ne correspond à votre recherche.", {
        exact: true,
      }),
    ).toBeVisible();
  });
});
