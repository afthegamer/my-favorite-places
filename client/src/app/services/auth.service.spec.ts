import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from './auth.service';

const tick = () => new Promise<void>((r) => setTimeout(r, 0));

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('getToken retourne null quand localStorage est vide', () => {
    expect(service.getToken()).toBeNull();
  });

  it('getToken retourne le token stocké dans localStorage', () => {
    localStorage.setItem('token', 'abc123');
    expect(service.getToken()).toBe('abc123');
  });

  it('login envoie POST /api/users/tokens et stocke le token', async () => {
    const loginPromise = service.login('test@test.com', 'pass123');

    const tokenReq = httpTesting.expectOne('/api/users/tokens');
    expect(tokenReq.request.method).toBe('POST');
    expect(tokenReq.request.body).toEqual({ email: 'test@test.com', password: 'pass123' });
    tokenReq.flush({ token: 'jwt-token-123' });

    await tick();

    const meReq = httpTesting.expectOne('/api/users/me');
    meReq.flush({ item: { id: 1, email: 'test@test.com', createdAt: '2025-01-01' } });

    await loginPromise;

    expect(localStorage.getItem('token')).toBe('jwt-token-123');
    expect(service.user()).toEqual({ id: 1, email: 'test@test.com', createdAt: '2025-01-01' });
    expect(service.isLoggedIn()).toBe(true);
  });

  it('register envoie POST /api/users puis appelle login', async () => {
    const registerPromise = service.register('new@test.com', 'pass456');

    const registerReq = httpTesting.expectOne('/api/users');
    expect(registerReq.request.method).toBe('POST');
    expect(registerReq.request.body).toEqual({ email: 'new@test.com', password: 'pass456' });
    registerReq.flush({ item: { id: 2, email: 'new@test.com', createdAt: '2025-01-01' } });

    await tick();

    const tokenReq = httpTesting.expectOne('/api/users/tokens');
    tokenReq.flush({ token: 'jwt-new' });

    await tick();

    const meReq = httpTesting.expectOne('/api/users/me');
    meReq.flush({ item: { id: 2, email: 'new@test.com', createdAt: '2025-01-01' } });

    await registerPromise;

    expect(localStorage.getItem('token')).toBe('jwt-new');
    expect(service.user()?.email).toBe('new@test.com');
  });

  it('logout supprime le token, réinitialise le user et navigue vers /login', () => {
    localStorage.setItem('token', 'some-token');
    const navigateSpy = vi.spyOn(router, 'navigate');

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(service.user()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('init ne fait rien si pas de token', async () => {
    await service.init();
    httpTesting.expectNone('/api/users/me');
  });

  it('init avec token valide charge le user', async () => {
    localStorage.setItem('token', 'valid-token');
    const initPromise = service.init();

    await tick();

    const meReq = httpTesting.expectOne('/api/users/me');
    meReq.flush({ item: { id: 1, email: 'init@test.com', createdAt: '2025-01-01' } });

    await initPromise;

    expect(service.user()?.email).toBe('init@test.com');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('init supprime le token si fetchMe échoue', async () => {
    localStorage.setItem('token', 'bad-token');
    const initPromise = service.init();

    await tick();

    const meReq = httpTesting.expectOne('/api/users/me');
    meReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    await initPromise;

    expect(localStorage.getItem('token')).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('isLoggedIn est false par défaut', () => {
    expect(service.isLoggedIn()).toBe(false);
  });
});
