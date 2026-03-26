import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('ajoute le header Authorization quand un token existe', () => {
    localStorage.setItem('token', 'my-jwt-token');

    http.get('/api/test').subscribe();

    const req = httpTesting.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-jwt-token');
    req.flush({});
  });

  it("n'ajoute pas le header Authorization quand pas de token", () => {
    http.get('/api/test').subscribe();

    const req = httpTesting.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('ne modifie pas le body ni la méthode de la requête', () => {
    localStorage.setItem('token', 'token');

    http.post('/api/data', { foo: 'bar' }).subscribe();

    const req = httpTesting.expectOne('/api/data');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ foo: 'bar' });
    req.flush({});
  });

  it('redirige vers /login et supprime le token sur une réponse 403', () => {
    localStorage.setItem('token', 'expired-token');
    const navigateSpy = vi.spyOn(router, 'navigate');

    http.get('/api/users/me').subscribe({ error: () => {} });

    const req = httpTesting.expectOne('/api/users/me');
    req.flush({ message: 'access denied' }, { status: 403, statusText: 'Forbidden' });

    expect(localStorage.getItem('token')).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('ne redirige pas sur une erreur non-403', () => {
    localStorage.setItem('token', 'valid-token');
    const navigateSpy = vi.spyOn(router, 'navigate');

    http.get('/api/test').subscribe({ error: () => {} });

    const req = httpTesting.expectOne('/api/test');
    req.flush({ message: 'not found' }, { status: 404, statusText: 'Not Found' });

    expect(localStorage.getItem('token')).toBe('valid-token');
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
