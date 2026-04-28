// src/app/enseignant/saisie-notes/saisie-notes/saisie-notes.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormArray,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { forkJoin } from 'rxjs';

import { AuthService }     from '../../../core/services/auth';
import { ExamenService }   from '../../../core/services/examen';
import { SessionService }  from '../../../core/services/session';
import { ModuleService }   from '../../../core/services/module';
import { EtudiantService } from '../../../core/services/etudiant';
import { NoteService }     from '../../../core/services/note';

import { Session, Examen, Module, Etudiant, Note } from '../../../models/index';

@Component({
  selector: 'app-saisie-notes',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './saisie-notes.html',
  styleUrl: './saisie-notes.scss'
})
export class SaisieNotes implements OnInit {
  private fb          = inject(FormBuilder);
  private auth        = inject(AuthService);
  private examenSvc   = inject(ExamenService);
  private sessionSvc  = inject(SessionService);
  private moduleSvc   = inject(ModuleService);
  private etudiantSvc = inject(EtudiantService);
  private noteSvc     = inject(NoteService);

  loading   = signal(false);
  saving    = signal(false);
  saved     = signal(false);
  error     = signal('');

  sessions          = signal<Session[]>([]);
  mesModules        = signal<Module[]>([]);
  examensFiltres    = signal<Examen[]>([]);
  selectedModule    = signal<Module | null>(null);
  selectedSessionId = signal<number | null>(null);
  selectedExamenId  = signal<number | null>(null);

  notesForm = this.fb.group({ notes: this.fb.array([]) });

  get notesArray(): FormArray {
    return this.notesForm.get('notes') as FormArray;
  }

  ngOnInit(): void {
    this.loading.set(true);
    const user = this.auth.currentUser();
    if (!user) return;

    forkJoin({
      sessions: this.sessionSvc.getAll(),
      modules:  this.moduleSvc.getByEnseignant(user.id)
    }).subscribe({
      next: ({ sessions, modules }) => {
        this.sessions.set(sessions);
        this.mesModules.set(modules);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erreur lors du chargement des données.');
        this.loading.set(false);
      }
    });
  }

  onSessionChange(event: Event): void {
    const id = +(event.target as HTMLSelectElement).value;
    this.examensFiltres.set([]);
    this.clearGrid();
    if (!id) return;
    this.selectedSessionId.set(id);
    const myModuleIds = this.mesModules().map(m => m.id);
    this.examenSvc.getBySession(id).subscribe(examens =>
      this.examensFiltres.set(examens.filter(e => myModuleIds.includes(e.moduleId)))
    );
  }

  onExamenChange(event: Event): void {
    const id = +(event.target as HTMLSelectElement).value;
    this.clearGrid();
    if (!id) return;
    this.selectedExamenId.set(id);
    this.saved.set(false);
    this.error.set('');

    const examen = this.examensFiltres().find(e => e.id === id)!;
    const module = this.mesModules().find(m => m.id === examen.moduleId)!;
    this.selectedModule.set(module);
    this.loading.set(true);

    forkJoin({
      etudiants:     this.etudiantSvc.getBySemestre(module.semestreId),
      existingNotes: this.noteSvc.getByExamen(id)
    }).subscribe({
      next: ({ etudiants, existingNotes }) => {
        this.buildGrid(etudiants, existingNotes, module);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erreur lors du chargement des étudiants.');
        this.loading.set(false);
      }
    });
  }

  private buildGrid(etudiants: Etudiant[], existingNotes: Note[], module: Module): void {
    this.clearGrid();
    etudiants.forEach(etudiant => {
      const existing = existingNotes.find(n => n.etudiantId === etudiant.id);
      const group = this.fb.group({
        etudiantId:  [etudiant.id],
        etudiantNom: [`${etudiant.nom} ${etudiant.prenom}`],
        noteId:      [existing?.id ?? null],
        noteCC:      [existing?.noteCC ?? null, [Validators.min(0), Validators.max(20)]],
        noteExamen:  [existing?.noteExamen ?? null, [Validators.min(0), Validators.max(20)]],
        absent:      [existing?.absent ?? false]
      });
      if (!module.hasCC) group.get('noteCC')!.disable();
      this.notesArray.push(group);
    });
  }

  private clearGrid(): void {
    this.notesArray.clear();
    this.selectedModule.set(null);
  }

  calculerNoteFinale(index: number): number | null {
    const row    = this.notesArray.at(index) as FormGroup;
    const absent = row.get('absent')!.value as boolean;
    if (absent) return 0;
    const module = this.selectedModule();
    const exam   = row.get('noteExamen')!.value as number | null;
    const cc     = row.get('noteCC')!.value     as number | null;
    if (exam === null || exam === undefined) return null;
    if (module?.hasCC && cc !== null && cc !== undefined) {
      return Math.round((cc * 0.3 + exam * 0.7) * 100) / 100;
    }
    return exam;
  }

  isNoteInsuffisante(index: number): boolean {
    const nf = this.calculerNoteFinale(index);
    return nf !== null && nf < 10;
  }

  countAbsents(): number {
    return (this.notesArray.controls as FormGroup[])
      .filter(r => r.get('absent')!.value === true).length;
  }

  countInsuffisant(): number {
    return this.notesArray.controls
      .map((_, i) => this.calculerNoteFinale(i))
      .filter(n => n !== null && (n as number) < 10).length;
  }

  countValide(): number {
    return this.notesArray.controls
      .map((_, i) => this.calculerNoteFinale(i))
      .filter(n => n !== null && (n as number) >= 10).length;
  }

  moduleName(examen: Examen): string {
    const m = this.mesModules().find(m => m.id === examen.moduleId);
    return m ? `${m.code} — ${m.nom}` : `Module #${examen.moduleId}`;
  }

  onSubmit(): void {
    if (this.notesArray.length === 0) return;
    if (this.notesForm.invalid) { this.notesForm.markAllAsTouched(); return; }

    const examenId = this.selectedExamenId()!;
    const module   = this.selectedModule()!;
    this.saving.set(true);
    this.error.set('');
    this.saved.set(false);

    const rows       = this.notesArray.controls as FormGroup[];
    const operations = rows.map((row, index) => {
      const absent     = row.get('absent')!.value     as boolean;
      const noteCC     = module.hasCC ? (row.get('noteCC')!.value as number | null) : null;
      const noteExamen = (row.get('noteExamen')!.value as number | null) ?? 0;
      const noteFinale = this.calculerNoteFinale(index) ?? 0;
      const etudiantId = row.get('etudiantId')!.value as number;
      const noteId     = row.get('noteId')!.value     as number | null;

      const payload: Omit<Note, 'id'> = {
        examenId, etudiantId,
        noteCC:     noteCC ?? undefined,
        noteExamen, noteFinale, absent
      };
      return noteId
        ? this.noteSvc.update(noteId, payload)
        : this.noteSvc.create(payload);
    });

    forkJoin(operations).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        this.noteSvc.getByExamen(examenId).subscribe(notes => {
          rows.forEach(row => {
            const etId  = row.get('etudiantId')!.value as number;
            const found = notes.find(n => n.etudiantId === etId);
            if (found) row.get('noteId')!.setValue(found.id);
          });
        });
      },
      error: () => {
        this.error.set("Erreur lors de l'enregistrement. Veuillez réessayer.");
        this.saving.set(false);
      }
    });
  }
}
