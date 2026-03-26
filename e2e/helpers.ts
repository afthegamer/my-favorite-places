import { Page, expect } from '@playwright/test';

export async function register(page: Page, email: string, password: string) {
  await page.goto('/register');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(password);
  await page.getByLabel('Confirmer le mot de passe').fill(password);
  await page.getByRole('button', { name: "S'inscrire" }).click();
  await page.waitForURL('/', { timeout: 10_000 });
}

export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mot de passe').fill(password);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.waitForURL('/', { timeout: 10_000 });
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: 'Déconnexion' }).click();
  await page.waitForURL('/login', { timeout: 5_000 });
}
