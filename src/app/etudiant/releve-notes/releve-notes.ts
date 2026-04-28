import { Component, inject, signal, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth';
import { NoteService } from '../../core/services/note';
import { ExamenService } from '../../core/services/examen';
import { ModuleService } from '../../core/services/module';
import { DeliberationService } from '../../core/services/deliberation';
import { EtudiantService } from '../../core/services/etudiant';
import { NoteFormatPipe } from '../../pipes/note-format-pipe';
import { MentionPipe } from '../../pipes/mention-pipe';
import { DecisionLabelPipe } from '../../pipes/decision-label-pipe';
import { Note, Examen, Module, Deliberation, Etudiant } from '../../models/index';

interface NoteRow {
  moduleNom: string;
  moduleCode: string;
  coefficient: number;
  noteCC: number | null;
  noteExamen: number;
  noteFinale: number;
  valide: boolean;
}

@Component({
  selector: 'app-releve-notes',
  imports: [NoteFormatPipe, MentionPipe, DecisionLabelPipe],
  templateUrl: './releve-notes.html',
  styleUrl: './releve-notes.scss'
})
export class ReleveNotes implements OnInit {
  private auth    = inject(AuthService);
  private noteSvc = inject(NoteService);
  private examenSvc = inject(ExamenService);
  private moduleSvc = inject(ModuleService);
  private deliberationSvc = inject(DeliberationService);
  private etudiantSvc = inject(EtudiantService);

  loading      = signal(false);
  etudiant     = signal<Etudiant | null>(null);
  noteRows     = signal<NoteRow[]>([]);
  deliberation = signal<Deliberation | null>(null);
  moyenne      = signal(0);
  annee        = '2025-2026';

  ngOnInit() {
    const user = this.auth.currentUser();
    const etudiantId = user?.etudiantId;
    if (!etudiantId) return;

    this.loading.set(true);
    forkJoin({
      etudiant:      this.etudiantSvc.getById(etudiantId),
      notes:         this.noteSvc.getByEtudiant(etudiantId),
      examens:       this.examenSvc.getAll(),
      modules:       this.moduleSvc.getAll(),
      deliberations: this.deliberationSvc.getByEtudiant(etudiantId),
    }).subscribe({
      next: ({ etudiant, notes, examens, modules, deliberations }) => {
        this.etudiant.set(etudiant);

        const rows: NoteRow[] = notes.map(note => {
          const examen = examens.find(e => e.id === note.examenId);
          const module = modules.find(m => m.id === examen?.moduleId);
          return {
            moduleNom:   module?.nom ?? '—',
            moduleCode:  module?.code ?? '—',
            coefficient: module?.coefficient ?? 1,
            noteCC:      note.noteCC ?? null,
            noteExamen:  note.noteExamen,
            noteFinale:  note.noteFinale,
            valide:      note.noteFinale >= 10,
          };
        });
        this.noteRows.set(rows);

        const total = rows.reduce((s, r) => s + r.noteFinale * r.coefficient, 0);
        const coefs = rows.reduce((s, r) => s + r.coefficient, 0);
        this.moyenne.set(coefs > 0 ? Math.round(total / coefs * 100) / 100 : 0);

        if (deliberations.length > 0) {
          deliberations.sort((a, b) => b.sessionId - a.sessionId);
          this.deliberation.set(deliberations[0]);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  print() { window.print(); }
}
