import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';

export const enseignantRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard }
];
