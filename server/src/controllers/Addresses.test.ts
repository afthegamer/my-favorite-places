import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';

vi.mock('../utils/getCoordinatesFromSearch', () => ({
  getCoordinatesFromSearch: vi.fn(),
}));

import app from '../app';
import { getCoordinatesFromSearch } from '../utils/getCoordinatesFromSearch';
import { setupTestDB, teardownTestDB, createTestUser } from '../test-utils';

const mockedGetCoordinates = vi.mocked(getCoordinatesFromSearch);

describe('Addresses Controller', () => {
  let token1: string;
  let token2: string;

  beforeAll(async () => {
    await setupTestDB();
    const u1 = await createTestUser('addr-user1@test.com', 'pass123');
    const u2 = await createTestUser('addr-user2@test.com', 'pass123');
    token1 = u1.token;
    token2 = u2.token;
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/addresses', () => {
    it('devrait créer une adresse avec des données valides', async () => {
      mockedGetCoordinates.mockResolvedValueOnce({ lng: 2.3522, lat: 48.8566 });

      const res = await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${token1}`)
        .send({ name: 'Tour Eiffel', searchWord: 'tour eiffel paris' });

      expect(res.status).toBe(200);
      expect(res.body.item).toBeDefined();
      expect(res.body.item.name).toBe('Tour Eiffel');
      expect(res.body.item.lng).toBe(2.3522);
      expect(res.body.item.lat).toBe(48.8566);
    });

    it('devrait créer une adresse avec description optionnelle', async () => {
      mockedGetCoordinates.mockResolvedValueOnce({ lng: 2.295, lat: 48.858 });

      const res = await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          name: 'Musée',
          searchWord: 'musée paris',
          description: 'Un super musée',
        });

      expect(res.status).toBe(200);
      expect(res.body.item.description).toBe('Un super musée');
    });

    it('devrait retourner 400 si name manquant', async () => {
      const res = await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${token1}`)
        .send({ searchWord: 'paris' });

      expect(res.status).toBe(400);
    });

    it('devrait retourner 400 si searchWord manquant', async () => {
      const res = await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${token1}`)
        .send({ name: 'Lieu' });

      expect(res.status).toBe(400);
    });

    it('devrait retourner 404 si le geocoding échoue', async () => {
      mockedGetCoordinates.mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${token1}`)
        .send({ name: 'Inconnu', searchWord: 'xyznonexistent' });

      expect(res.status).toBe(404);
    });

    it('devrait retourner 403 sans authentification', async () => {
      const res = await request(app)
        .post('/api/addresses')
        .send({ name: 'Test', searchWord: 'test' });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/addresses', () => {
    it('devrait retourner les adresses de l\'utilisateur', async () => {
      const res = await request(app)
        .get('/api/addresses')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBeGreaterThanOrEqual(1);
    });

    it('devrait retourner une liste vide pour un nouvel utilisateur', async () => {
      const res = await request(app)
        .get('/api/addresses')
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(200);
      expect(res.body.items).toEqual([]);
    });

    it('devrait retourner 403 sans authentification', async () => {
      const res = await request(app).get('/api/addresses');

      expect(res.status).toBe(403);
    });

    it('devrait isoler les adresses entre utilisateurs', async () => {
      mockedGetCoordinates.mockResolvedValueOnce({ lng: 5.3698, lat: 43.2965 });

      await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${token2}`)
        .send({ name: 'Marseille', searchWord: 'marseille' });

      const res1 = await request(app)
        .get('/api/addresses')
        .set('Authorization', `Bearer ${token1}`);

      const hasMarseille = res1.body.items.some(
        (a: { name: string }) => a.name === 'Marseille',
      );
      expect(hasMarseille).toBe(false);

      const res2 = await request(app)
        .get('/api/addresses')
        .set('Authorization', `Bearer ${token2}`);

      const hasMarseille2 = res2.body.items.some(
        (a: { name: string }) => a.name === 'Marseille',
      );
      expect(hasMarseille2).toBe(true);
    });
  });

  describe('POST /api/addresses/searches', () => {
    beforeAll(async () => {
      mockedGetCoordinates.mockResolvedValueOnce({ lng: 4.8357, lat: 45.764 });
      await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${token1}`)
        .send({ name: 'Lyon', searchWord: 'lyon' });
    });

    it('devrait retourner les adresses dans le rayon', async () => {
      const res = await request(app)
        .post('/api/addresses/searches')
        .set('Authorization', `Bearer ${token1}`)
        .send({ radius: 500, from: { lng: 2.3522, lat: 48.8566 } });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBeGreaterThanOrEqual(1);
    });

    it('devrait exclure les adresses hors du rayon', async () => {
      const res = await request(app)
        .post('/api/addresses/searches')
        .set('Authorization', `Bearer ${token1}`)
        .send({ radius: 100, from: { lng: 2.3522, lat: 48.8566 } });

      expect(res.status).toBe(200);
      const hasLyon = res.body.items.some(
        (a: { name: string }) => a.name === 'Lyon',
      );
      expect(hasLyon).toBe(false);
    });

    it('devrait retourner 400 si radius manquant', async () => {
      const res = await request(app)
        .post('/api/addresses/searches')
        .set('Authorization', `Bearer ${token1}`)
        .send({ from: { lng: 2.3522, lat: 48.8566 } });

      expect(res.status).toBe(400);
    });

    it('devrait retourner 400 si radius négatif', async () => {
      const res = await request(app)
        .post('/api/addresses/searches')
        .set('Authorization', `Bearer ${token1}`)
        .send({ radius: -10, from: { lng: 2.3522, lat: 48.8566 } });

      expect(res.status).toBe(400);
    });

    it('devrait retourner 400 si from est invalide', async () => {
      const res = await request(app)
        .post('/api/addresses/searches')
        .set('Authorization', `Bearer ${token1}`)
        .send({ radius: 100, from: { lng: 'abc' } });

      expect(res.status).toBe(400);
    });

    it('devrait retourner 403 sans authentification', async () => {
      const res = await request(app)
        .post('/api/addresses/searches')
        .send({ radius: 100, from: { lng: 2.3522, lat: 48.8566 } });

      expect(res.status).toBe(403);
    });
  });
});
