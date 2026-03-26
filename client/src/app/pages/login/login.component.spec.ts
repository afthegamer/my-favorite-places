import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authMock: { login: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    authMock = { login: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('crée le composant avec email et password', () => {
    expect(component.form.get('email')).toBeTruthy();
    expect(component.form.get('password')).toBeTruthy();
  });

  it('le formulaire est invalide quand vide', () => {
    expect(component.form.valid).toBe(false);
  });

  it("l'email rejette un format invalide", () => {
    component.form.patchValue({ email: 'notanemail', password: 'pass' });
    expect(component.form.get('email')?.hasError('email')).toBe(true);
    expect(component.form.valid).toBe(false);
  });

  it('onSubmit ne fait rien quand le formulaire est invalide', async () => {
    await component.onSubmit();
    expect(authMock.login).not.toHaveBeenCalled();
  });

  it('onSubmit appelle auth.login et navigue vers /', async () => {
    authMock.login.mockResolvedValue(undefined);
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.form.patchValue({ email: 'test@test.com', password: 'pass123' });
    await component.onSubmit();

    expect(authMock.login).toHaveBeenCalledWith('test@test.com', 'pass123');
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
    expect(component.loading).toBe(false);
  });

  it("onSubmit met l'erreur en cas d'échec", async () => {
    authMock.login.mockRejectedValue({ error: { message: 'Identifiants invalides' } });

    component.form.patchValue({ email: 'test@test.com', password: 'wrong' });
    await component.onSubmit();

    expect(component.error).toBe('Identifiants invalides');
    expect(component.loading).toBe(false);
  });
});
