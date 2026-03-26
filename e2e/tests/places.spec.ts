import { test, expect } from '@playwright/test';
import { register } from '../helpers';

test.describe.serial('Gestion des lieux', () => {
  const suffix = Date.now();
  const email = `places-${suffix}@test.com`;
  const password = 'pass1234';

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await register(page, email, password);
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    const addressesLoaded = page.waitForResponse(
      (resp) => resp.url().includes('/api/addresses') && resp.status() === 200
    );
    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Mot de passe').fill(password);
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await page.waitForURL('/', { timeout: 10_000 });
    await addressesLoaded;
    await page.getByLabel('Nom').fill('x');
    await page.getByLabel('Nom').fill('');
  });

  test('dashboard affiche la liste vide au départ', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Mes lieux \(0\)/ })).toBeVisible();
    await expect(page.getByText('Aucun lieu enregistré')).toBeVisible();
  });

  test('la carte Leaflet est visible', async ({ page }) => {
    await expect(page.locator('.leaflet-container')).toBeVisible();
  });

  test('bouton Ajouter désactivé quand champs requis vides', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Ajouter' })).toBeDisabled();
  });

  test('ajout d\'un lieu avec Paris', async ({ page }) => {
    await page.getByLabel('Nom').fill('Tour Eiffel');
    await page.getByLabel('Recherche de lieu').fill('Paris Tour Eiffel');

    const addBtn = page.getByRole('button', { name: 'Ajouter' });
    await expect(addBtn).toBeEnabled();
    await addBtn.click();

    await expect(page.getByRole('heading', { name: /Mes lieux \(1\)/ })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Tour Eiffel')).toBeVisible();
  });

  test('le lieu affiche des coordonnées', async ({ page }) => {
    await expect(page.getByText('Tour Eiffel')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.place-coords').first()).toHaveText(/\d+\.\d+/);
  });

  test('ajout d\'un deuxième lieu', async ({ page }) => {
    await page.getByLabel('Nom').fill('Colisée');
    await page.getByLabel('Recherche de lieu').fill('Rome Colosseum');

    await page.getByRole('button', { name: 'Ajouter' }).click();

    await expect(page.getByRole('heading', { name: /Mes lieux \(2\)/ })).toBeVisible({ timeout: 15_000 });
  });

  test('sélection d\'un lieu dans la liste', async ({ page }) => {
    await expect(page.getByText('Tour Eiffel')).toBeVisible({ timeout: 10_000 });
    await page.getByText('Tour Eiffel').click();
    await expect(page.locator('.leaflet-container')).toBeVisible();
  });
});
