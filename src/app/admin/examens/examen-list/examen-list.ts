import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ExamenService } from '../../../core/services/examen';
import { SessionService } from '../../../core/services/session';
import { ModuleService } from '../../../core/services/module';
import { Examen, Session, Module } from '../../../models/index';

@Component({
  selector: 'app-examen-list',
  imports: [RouterLink],
  templateUrl: './examen-list.html',
  styleUrl: './examen-list.scss'
})
export class ExamenList implements OnInit {
  private examenSvc = inject(ExamenService);
  private sessionSvc = inject(SessionService);
  private moduleSvc = inject(ModuleService);

  examens = signal<Examen[]>([]);
  sessions = signal<Session[]>([]);
  modules = signal<Module[]>([]);
  loading = signal(false);
  error = signal('');

  // Filter state
  selectedSession = signal<number | 'all'>('all');

  filteredExamens = computed(() => {
    const sel = this.selectedSession();
    if (sel === 'all') return this.examens();
    return this.examens().filter(e => e.sessionId === sel);
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    forkJoin({
      examens: this.examenSvc.getAll(),
      sessions: this.sessionSvc.getAll(),
      modules: this.moduleSvc.getAll()
    }).subscribe({
      next: ({ examens, sessions, modules }) => {
        this.examens.set(examens);
        this.sessions.set(sessions);
        this.modules.set(modules);
        this.loading.set(false);
      },
      error: () => { this.error.set('Erreur de chargement'); this.loading.set(false); }
    });
  }

  delete(id: number) {
    if (!confirm('Supprimer cet examen ?')) return;
    this.examenSvc.delete(id).subscribe(() => this.load());
  }

  getSessionLabel(sessionId: number): string {
    const s = this.sessions().find(s => s.id === sessionId);
    return s ? `Session ${s.id} — ${s.type === 'normale' ? 'Normale' : 'Rattrapage'}` : `S${sessionId}`;
  }

  getModuleLabel(moduleId: number): string {
    const m = this.modules().find(m => m.id === moduleId);
    return m ? `${m.code} — ${m.nom}` : `Module ${moduleId}`;
  }

  onSessionFilter(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedSession.set(val === 'all' ? 'all' : +val);
  }
}
