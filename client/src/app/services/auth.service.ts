import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<User | null>(null);
  user = this.currentUser.asReadonly();
  isLoggedIn = computed(() => !!this.currentUser());

  constructor(private http: HttpClient, private router: Router) {}

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  private clearToken(): void {
    localStorage.removeItem('token');
  }

  async init(): Promise<void> {
    if (!this.getToken()) return;
    try {
      await this.fetchMe();
    } catch {
      this.clearToken();
    }
  }

  async login(email: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<{ token: string }>('/api/users/tokens', { email, password })
    );
    this.setToken(res.token);
    await this.fetchMe();
  }

  async register(email: string, password: string): Promise<void> {
    await firstValueFrom(
      this.http.post<{ item: User }>('/api/users', { email, password })
    );
    await this.login(email, password);
  }

  private async fetchMe(): Promise<void> {
    const res = await firstValueFrom(
      this.http.get<{ item: User }>('/api/users/me')
    );
    this.currentUser.set(res.item);
  }

  logout(): void {
    this.clearToken();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
