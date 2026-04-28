import { Routes } from '@angular/router';
import { MesNotes } from './mes-notes/mes-notes';
import { ReleveNotes } from './releve-notes/releve-notes';

export const etudiantRoutes: Routes = [
  { path: '',              redirectTo: 'mes-notes', pathMatch: 'full' },
  { path: 'mes-notes',    component: MesNotes },
  { path: 'releve-notes', component: ReleveNotes },
];
