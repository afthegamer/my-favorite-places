import { test, expect } from '@playwright/test';
import { register, login, logout } from '../helpers';

test.describe.serial('Authentification', () => {
  const suffix = Date.now();
  const email = `auth-${suffix}@test.com`;
  const password = 'pass1234';

  test('redirige vers /login si non connecté', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('inscription réussie redirige vers le dashboard', async ({ page }) => {
    await register(page, email, password);
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Ajouter un lieu' })).toBeVisible();
  });

  test('la navbar affiche l\'email quand connecté', async ({ page }) => {
    await login(page, email, password);
    await expect(page.getByText(email)).toBeVisible();
  });

  test('logout redirige vers /login', async ({ page }) => {
    await login(page, email, password);
    await logout(page);
    await expect(page).toHaveURL(/\/login/);
  });

  test('login réussi après logout', async ({ page }) => {
    await login(page, email, password);
    await expect(page).toHaveURL('/');
    await expect(page.getByText(email)).toBeVisible();
  });

  test('login échoué avec mauvais mot de passe', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Mot de passe').fill('wrongpassword');
    const [response] = await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/api/users/tokens')),
      page.getByRole('button', { name: 'Se connecter' }).click(),
    ]);
    expect(response.status()).toBe(400);
    await page.getByLabel('Mot de passe').fill('');
    await page.getByLabel('Mot de passe').fill('wrongpassword');
    await expect(page.getByText(/wrong credentials|erreur de connexion/i)).toBeVisible({ timeout: 10_000 });
  });

  test('validation : mots de passe différents à l\'inscription', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('Email').fill('validation@test.com');
    await page.getByLabel('Mot de passe', { exact: true }).fill('pass1234');
    await page.getByLabel('Confirmer le mot de passe').fill('different');
    await page.getByLabel('Confirmer le mot de passe').click();
    await page.getByLabel('Confirmer le mot de passe').press('Tab');
    await expect(page.getByText('ne correspondent pas')).toBeVisible();
  });

  test('bouton submit désactivé quand formulaire vide', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeDisabled();
  });
});
