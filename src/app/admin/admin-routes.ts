import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { SessionList } from './sessions/session-list/session-list';
import { SessionForm } from './sessions/session-form/session-form';

export const adminRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AdminDashboard },
  { path: 'sessions', component: SessionList },
  { path: 'sessions/new', component: SessionForm },
  { path: 'sessions/edit/:id', component: SessionForm },
];
