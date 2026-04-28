import { Component, inject, signal, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/services/auth';
import { ModuleService } from '../../../core/services/module';
import { ExamenService } from '../../../core/services/examen';
import { NoteService } from '../../../core/services/note';
import { EtudiantService } from '../../../core/services/etudiant';
import { NoteFormatPipe } from '../../../pipes/note-format-pipe';
import { Module, Examen, Note, Etudiant } from '../../../models/index';

interface NoteRow {
  etudiant: Etudiant;
  noteCC: number | null;
  noteExamen: number;
  noteFinale: number;
  absent: boolean;
  valide: boolean;
}

@Component({
  selector: 'app-notes-module',
  imports: [NoteFormatPipe],
  templateUrl: './notes-module.html',
  styleUrl: './notes-module.scss'
})
export class NotesModule implements OnInit {
  private auth        = inject(AuthService);
  private moduleSvc   = inject(ModuleService);
  private examenSvc   = inject(ExamenService);
  private noteSvc     = inject(NoteService);
  private etudiantSvc = inject(EtudiantService);

  loading  = signal(false);
  error    = signal('');

  modules         = signal<Module[]>([]);
  selectedModule  = signal<Module | null>(null);
  selectedExamen  = signal<Examen | null>(null);
  examens         = signal<Examen[]>([]);
  noteRows        = signal<NoteRow[]>([]);

  // Stats
  moyenne       = signal(0);
  tauxReussite  = signal(0);
  nbValides     = signal(0);

  ngOnInit() {
    const user = this.auth.currentUser();
    if (!user) return;

    this.moduleSvc.getByEnseignant(user.id).subscribe({
      next: (modules) => {
        this.modules.set(modules);
        if (modules.length > 0) this.onModuleChange(modules[0].id);
      },
      error: () => this.error.set('Erreur chargement modules')
    });
  }

  onModuleChange(moduleId: number | string) {
    const mod = this.modules().find(m => Number(m.id) === Number(moduleId));
    if (!mod) return;
    this.selectedModule.set(mod);
    this.noteRows.set([]);
    this.examens.set([]);

    this.examenSvc.getAll().subscribe({
      next: (examens) => {
        const modExamens = examens.filter(e => Number(e.moduleId) === Number(moduleId));
        this.examens.set(modExamens);
        if (modExamens.length > 0) this.loadNotes(modExamens[0]);
      }
    });
  }

  onExamenChange(examenId: number | string) {
    const ex = this.examens().find(e => Number(e.id) === Number(examenId));
    if (ex) this.loadNotes(ex);
  }

  loadNotes(examen: Examen) {
    this.selectedExamen.set(examen);
    this.loading.set(true);

    forkJoin({
      notes:     this.noteSvc.getByExamen(examen.id),
      etudiants: this.etudiantSvc.getAll(),
    }).subscribe({
      next: ({ notes, etudiants }) => {
        const rows: NoteRow[] = notes.map(note => {
          const etudiant = etudiants.find(e => Number(e.id) === Number(note.etudiantId))!;
          return {
            etudiant,
            noteCC:      note.noteCC ?? null,
            noteExamen:  note.noteExamen,
            noteFinale:  note.noteFinale,
            absent:      note.absent,
            valide:      note.noteFinale >= 10,
          };
        });

        // Sort by noteFinale desc
        rows.sort((a, b) => b.noteFinale - a.noteFinale);
        this.noteRows.set(rows);

        // Compute stats
        const finales = rows.filter(r => !r.absent).map(r => r.noteFinale);
        if (finales.length > 0) {
          const moy = finales.reduce((s, n) => s + n, 0) / finales.length;
          this.moyenne.set(Math.round(moy * 100) / 100);
          const val = finales.filter(n => n >= 10).length;
          this.nbValides.set(val);
          this.tauxReussite.set(Math.round(val / finales.length * 100));
        }

        this.loading.set(false);
      },
      error: () => { this.error.set('Erreur chargement notes'); this.loading.set(false); }
    });
  }
}
