// src/app/admin/examens/examen-list/examen-list.ts
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ExamenService } from '../../../core/services/examen';
import { SessionService } from '../../../core/services/session';
import { ModuleService }  from '../../../core/services/module';
import { Examen, Session, Module } from '../../../models/index';

@Component({
  selector: 'app-examen-list',
  imports: [RouterLink],
  templateUrl: './examen-list.html',
  styleUrl: './examen-list.scss'
})
export class ExamenList implements OnInit {
  private svc        = inject(ExamenService);
  private sessionSvc = inject(SessionService);
  private moduleSvc  = inject(ModuleService);

  examens  = signal<Examen[]>([]);
  sessions = signal<Session[]>([]);
  modules  = signal<Module[]>([]);

  loading = signal(false);
  error   = signal('');

  selectedSessionId = signal<number | 'all'>('all');

  // Computed filtered list — updates automatically when signals change
  filteredExamens = computed(() => {
    const sid = this.selectedSessionId();
    if (sid === 'all') return this.examens();
    return this.examens().filter(e => e.sessionId === sid);
  });

  ngOnInit(): void {
    this.loading.set(true);
    forkJoin({
      examens:  this.svc.getAll(),
      sessions: this.sessionSvc.getAll(),
      modules:  this.moduleSvc.getAll()
    }).subscribe({
      next: ({ examens, sessions, modules }) => {
        this.examens.set(examens);
        this.sessions.set(sessions);
        this.modules.set(modules);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erreur lors du chargement des examens.');
        this.loading.set(false);
      }
    });
  }

  onSessionFilter(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedSessionId.set(val === 'all' ? 'all' : +val);
  }

  delete(id: number): void {
    if (!confirm('Supprimer cet examen ?')) return;
    this.svc.delete(id).subscribe({
      next: () => this.examens.update(list => list.filter(e => e.id !== id)),
      error: () => this.error.set('Erreur lors de la suppression.')
    });
  }

  getModuleLabel(moduleId: number): string {
    const m = this.modules().find(m => m.id === moduleId);
    return m ? `${m.code} — ${m.nom}` : `Module #${moduleId}`;
  }

  getSessionLabel(sessionId: number): string {
    const s = this.sessions().find(s => s.id === sessionId);
    return s
      ? `${s.type === 'normale' ? 'Normale' : 'Rattrapage'} (${s.dateDebut})`
      : `Session #${sessionId}`;
  }
}
