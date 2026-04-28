import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map, catchError, throwError } from 'rxjs';
import { User, UserRole } from '../../models/index';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API = 'http://localhost:3000';
  private readonly STORAGE_KEY = 'examens_user';

  // Signal-based state (Angular 17+ style)
  currentUser = signal<User | null>(this.loadFromStorage());

  isLoggedIn = computed(() => this.currentUser() !== null);
  userRole = computed(() => this.currentUser()?.role ?? null);
  isAdmin = computed(() => this.userRole() === 'admin');
  isEnseignant = computed(() => this.userRole() === 'enseignant');
  isEtudiant = computed(() => this.userRole() === 'etudiant');

  login(email: string, password: string): Observable<User> {
    return this.http
      .get<User[]>(`${this.API}/users?email=${email}&password=${password}`)
      .pipe(
        map(users => {
          if (!users.length) throw new Error('Email ou mot de passe incorrect');
          const user = users[0];
          // Never return password to client
          const { password: _, ...safeUser } = user as any;
          return safeUser as User;
        }),
        tap(user => {
          this.currentUser.set(user);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
          this.redirectByRole(user.role);
        }),
        catchError(err => throwError(() => err))
      );
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  redirectByRole(role: UserRole): void {
    const routes: Record<UserRole, string> = {
      admin: '/admin/dashboard',
      enseignant: '/enseignant/dashboard',
      etudiant: '/etudiant/mes-notes'
    };
    this.router.navigate([routes[role]]);
  }

  private loadFromStorage(): User | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
