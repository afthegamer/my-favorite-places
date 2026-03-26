import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { setupTestDB, teardownTestDB, createTestUser } from '../test-utils';

describe('Users Controller', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('POST /api/users', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ email: 'register@test.com', password: 'pass123' });

      expect(res.status).toBe(200);
      expect(res.body.item).toBeDefined();
      expect(res.body.item.email).toBe('register@test.com');
    });

    it('devrait retourner 400 si email manquant', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ password: 'pass123' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('devrait retourner 400 si password manquant', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ email: 'nopass@test.com' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('devrait ne pas exposer le hashedPassword dans la réponse', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ email: 'nohash@test.com', password: 'pass123' });

      expect(res.status).toBe(200);
      expect(res.body.item.email).toBe('nohash@test.com');
      expect(res.body.item.id).toBeDefined();
      expect(res.body.item.hashedPassword).toBeUndefined();
    });
  });

  describe('POST /api/users/tokens', () => {
    it('devrait retourner un token JWT pour des identifiants valides', async () => {
      await request(app)
        .post('/api/users')
        .send({ email: 'login@test.com', password: 'pass123' });

      const res = await request(app)
        .post('/api/users/tokens')
        .send({ email: 'login@test.com', password: 'pass123' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(typeof res.body.token).toBe('string');
    });

    it('devrait retourner 400 si email manquant', async () => {
      const res = await request(app)
        .post('/api/users/tokens')
        .send({ password: 'pass123' });

      expect(res.status).toBe(400);
    });

    it('devrait retourner 400 pour un mauvais mot de passe', async () => {
      const res = await request(app)
        .post('/api/users/tokens')
        .send({ email: 'login@test.com', password: 'wrongpass' });

      expect(res.status).toBe(400);
    });

    it('devrait retourner 400 pour un utilisateur inexistant', async () => {
      const res = await request(app)
        .post('/api/users/tokens')
        .send({ email: 'ghost@test.com', password: 'pass123' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/users/me', () => {
    it('devrait retourner l\'utilisateur courant avec un token valide', async () => {
      const { token } = await createTestUser('me@test.com', 'pass123');

      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.item).toBeDefined();
      expect(res.body.item.email).toBe('me@test.com');
    });

    it('devrait retourner 403 sans token', async () => {
      const res = await request(app).get('/api/users/me');

      expect(res.status).toBe(403);
    });

    it('devrait retourner 403 avec un token invalide', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(res.status).toBe(403);
    });
  });
});
