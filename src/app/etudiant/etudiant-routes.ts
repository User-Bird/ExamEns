import { Routes } from '@angular/router';
import { MesNotes } from './mes-notes/mes-notes';

export const etudiantRoutes: Routes = [
  { path: '', redirectTo: 'mes-notes', pathMatch: 'full' },
  { path: 'mes-notes', component: MesNotes }
];
