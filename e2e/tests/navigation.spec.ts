import { test, expect } from '@playwright/test';
import { register } from '../helpers';

test.describe.serial('Navigation', () => {
  const suffix = Date.now();
  const email = `nav-${suffix}@test.com`;
  const password = 'pass1234';

  test('liens Connexion/Inscription visibles quand déconnecté', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: 'Connexion' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Inscription' })).toBeVisible();
  });

  test('navigation de login vers register via le lien', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Créer un compte' }).click();
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByRole('heading', { name: 'Inscription' })).toBeVisible();
  });

  test('navigation de register vers login via le lien', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('link', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
  });

  test('persistance de session après reload', async ({ page }) => {
    await register(page, email, password);
    await expect(page).toHaveURL('/');

    await page.reload();

    await expect(page).toHaveURL('/');
    await expect(page.getByText(email)).toBeVisible();
  });
});
