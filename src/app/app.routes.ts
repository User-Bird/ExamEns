import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.Login)
  },

  {
    path: 'admin',
    component: Shell,           // ← Shell wraps the sidebar around children
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadChildren: () => import('./admin/admin-routes').then(m => m.adminRoutes)
  },

  {
    path: 'enseignant',
    component: Shell,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['enseignant'] },
    loadChildren: () => import('./enseignant/enseignant-routes').then(m => m.enseignantRoutes)
  },

  {
    path: 'etudiant',
    component: Shell,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['etudiant'] },
    loadChildren: () => import('./etudiant/etudiant-routes').then(m => m.etudiantRoutes)
  },

  { path: '**', redirectTo: '/login' }
];
