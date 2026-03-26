import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authMock: {
    isLoggedIn: ReturnType<typeof signal<boolean>>;
    user: ReturnType<typeof signal<User | null>>;
    logout: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authMock = {
      isLoggedIn: signal(false),
      user: signal<User | null>(null),
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
  });

  it('affiche les liens Connexion/Inscription quand non connecté', () => {
    authMock.isLoggedIn.set(false);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Connexion');
    expect(el.textContent).toContain('Inscription');
    expect(el.querySelector('.btn-logout')).toBeNull();
  });

  it("affiche l'email et le bouton Déconnexion quand connecté", () => {
    authMock.isLoggedIn.set(true);
    authMock.user.set({ id: 1, email: 'user@test.com', createdAt: '2025-01-01' });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('user@test.com');
    expect(el.querySelector('.btn-logout')).toBeTruthy();
  });

  it('appelle auth.logout quand on clique sur Déconnexion', () => {
    authMock.isLoggedIn.set(true);
    authMock.user.set({ id: 1, email: 'user@test.com', createdAt: '2025-01-01' });
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('.btn-logout') as HTMLElement;
    btn.click();

    expect(authMock.logout).toHaveBeenCalled();
  });
});
