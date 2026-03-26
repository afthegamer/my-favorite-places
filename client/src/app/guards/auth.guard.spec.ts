import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authMock: { getToken: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(() => {
    authMock = { getToken: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
      ],
    });
    router = TestBed.inject(Router);
  });

  it('retourne true quand un token existe', () => {
    authMock.getToken.mockReturnValue('valid-token');
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any)
    );
    expect(result).toBe(true);
  });

  it('retourne un UrlTree vers /login quand pas de token', () => {
    authMock.getToken.mockReturnValue(null);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any)
    );
    expect(result).toEqual(router.createUrlTree(['/login']));
  });
});
