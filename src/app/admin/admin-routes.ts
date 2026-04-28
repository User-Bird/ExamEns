import { Routes } from '@angular/router';
import { AdminDashboard } from './dashboard/dashboard';

export const adminRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AdminDashboard }
];
