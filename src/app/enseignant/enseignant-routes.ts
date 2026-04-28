import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { SaisieNotes } from './saisie-notes/saisie-notes/saisie-notes';
import { NotesModule } from './notes-module/notes-module/notes-module';  // ← add this

export const enseignantRoutes: Routes = [
  { path: '',              redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard',    component: Dashboard },
  { path: 'saisie-notes', component: SaisieNotes },
  { path: 'notes-module', component: NotesModule },  // ← add this
];
