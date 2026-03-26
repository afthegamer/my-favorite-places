import { test, expect } from '@playwright/test';
import { register } from '../helpers';

test.describe.serial('Recherche par rayon', () => {
  const suffix = Date.now();
  const email = `search-${suffix}@test.com`;
  const password = 'pass1234';

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await register(page, email, password);

    await page.getByLabel('Nom').fill('Tour Eiffel');
    await page.getByLabel('Recherche de lieu').fill('Paris Tour Eiffel');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page.getByText('Tour Eiffel')).toBeVisible({ timeout: 15_000 });

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
    await expect(page.getByText('Tour Eiffel')).toBeVisible({ timeout: 10_000 });
  });

  test('bouton recherche désactivé quand radius < 0.1', async ({ page }) => {
    await page.getByLabel('Latitude').fill('48.85');
    await page.getByLabel('Longitude').fill('2.29');
    await page.getByLabel('Rayon (km)').fill('0');

    await expect(page.getByRole('button', { name: 'Rechercher' })).toBeDisabled();
  });

  test('recherche retourne des résultats autour de Paris', async ({ page }) => {
    await page.getByLabel('Latitude').fill('48.85');
    await page.getByLabel('Longitude').fill('2.29');
    await page.getByLabel('Rayon (km)').fill('10');

    await page.getByRole('button', { name: 'Rechercher' }).click();

    await expect(page.getByText(/\d+ résultat/)).toBeVisible({ timeout: 10_000 });
  });

  test('effacer la recherche retourne à la liste complète', async ({ page }) => {
    await page.getByLabel('Latitude').fill('48.85');
    await page.getByLabel('Longitude').fill('2.29');
    await page.getByLabel('Rayon (km)').fill('10');
    await page.getByRole('button', { name: 'Rechercher' }).click();

    await expect(page.getByText(/\d+ résultat/)).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: 'Effacer la recherche' }).click();

    await expect(page.getByText(/\d+ résultat/)).not.toBeVisible();
    await expect(page.getByRole('heading', { name: /Mes lieux \(1\)/ })).toBeVisible();
  });

  test('recherche sans résultat loin de Paris', async ({ page }) => {
    await page.getByLabel('Latitude').fill('5');
    await page.getByLabel('Longitude').fill('-150');
    await page.getByLabel('Rayon (km)').fill('1');

    await expect(page.getByRole('button', { name: 'Rechercher' })).toBeEnabled({ timeout: 5_000 });

    const searchResponse = page.waitForResponse(
      (resp) => resp.url().includes('/api/addresses/searches') && resp.status() === 200
    );
    await page.getByRole('button', { name: 'Rechercher' }).click();
    await searchResponse;

    await page.getByLabel('Nom').fill('x');
    await page.getByLabel('Nom').fill('');

    await expect(page.getByText('0 résultat')).toBeVisible({ timeout: 10_000 });
  });
});
