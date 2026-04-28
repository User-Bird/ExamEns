import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login').then(m => m.LoginComponent)
  },

  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadChildren: () =>
      import('./admin/admin-routes').then(m => m.adminRoutes)
  },

  {
    path: 'enseignant',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['enseignant'] },
    loadChildren: () =>
      import('./enseignant/enseignant').then(m => m.enseignantRoutes)
  },

  {
    path: 'etudiant',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['etudiant'] },
    loadChildren: () =>
      import('./etudiant/etudiant').then(m => m.etudiantRoutes)
  },

  { path: '**', redirectTo: '/login' }
];
