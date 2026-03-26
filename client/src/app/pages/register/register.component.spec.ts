import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authMock: { register: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    authMock = { register: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('crée le formulaire avec email, password, confirmPassword', () => {
    expect(component.form.get('email')).toBeTruthy();
    expect(component.form.get('password')).toBeTruthy();
    expect(component.form.get('confirmPassword')).toBeTruthy();
  });

  it('le formulaire est invalide quand vide', () => {
    expect(component.form.valid).toBe(false);
  });

  it("l'email rejette un format invalide", () => {
    component.form.patchValue({ email: 'bad', password: 'pass1234', confirmPassword: 'pass1234' });
    expect(component.form.get('email')?.hasError('email')).toBe(true);
  });

  it('le password requiert minimum 4 caractères', () => {
    component.form.patchValue({ email: 'a@b.com', password: 'abc', confirmPassword: 'abc' });
    expect(component.form.get('password')?.hasError('minlength')).toBe(true);
  });

  it('passwordsMatch détecte des mots de passe différents', () => {
    component.form.patchValue({
      email: 'a@b.com',
      password: 'pass1234',
      confirmPassword: 'different',
    });
    expect(component.form.hasError('passwordsMismatch')).toBe(true);
  });

  it('passwordsMatch passe quand les mots de passe correspondent', () => {
    component.form.patchValue({
      email: 'a@b.com',
      password: 'pass1234',
      confirmPassword: 'pass1234',
    });
    expect(component.form.hasError('passwordsMismatch')).toBe(false);
    expect(component.form.valid).toBe(true);
  });

  it('onSubmit ne fait rien quand le formulaire est invalide', async () => {
    await component.onSubmit();
    expect(authMock.register).not.toHaveBeenCalled();
  });

  it('onSubmit appelle auth.register et navigue vers /', async () => {
    authMock.register.mockResolvedValue(undefined);
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.form.patchValue({
      email: 'new@test.com',
      password: 'pass1234',
      confirmPassword: 'pass1234',
    });
    await component.onSubmit();

    expect(authMock.register).toHaveBeenCalledWith('new@test.com', 'pass1234');
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
    expect(component.loading).toBe(false);
  });

  it("onSubmit met l'erreur en cas d'échec", async () => {
    authMock.register.mockRejectedValue({ error: { message: 'Email déjà utilisé' } });

    component.form.patchValue({
      email: 'dup@test.com',
      password: 'pass1234',
      confirmPassword: 'pass1234',
    });
    await component.onSubmit();

    expect(component.error).toBe('Email déjà utilisé');
    expect(component.loading).toBe(false);
  });

  it('loading est true pendant la soumission', async () => {
    let resolveRegister: () => void;
    authMock.register.mockReturnValue(
      new Promise<void>((r) => (resolveRegister = r))
    );

    component.form.patchValue({
      email: 'new@test.com',
      password: 'pass1234',
      confirmPassword: 'pass1234',
    });

    const submitPromise = component.onSubmit();
    expect(component.loading).toBe(true);

    resolveRegister!();
    await submitPromise;
    expect(component.loading).toBe(false);
  });
});
