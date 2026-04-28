import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../../core/services/session';
import { Session } from '../../../models/index';

@Component({
  selector: 'app-session-list',
  imports: [RouterLink],
  templateUrl: './session-list.html',
  styleUrl: './session-list.scss'
})
export class SessionList implements OnInit {
  private svc = inject(SessionService);

  sessions = signal<Session[]>([]);
  loading = signal(false);
  error = signal('');

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (data) => { this.sessions.set(data); this.loading.set(false); },
      error: () => { this.error.set('Erreur de chargement'); this.loading.set(false); }
    });
  }

  delete(id: number) {
    if (!confirm('Supprimer cette session ?')) return;
    this.svc.delete(id).subscribe(() => this.load());
  }

  advance(session: Session) {
    const next = this.svc.advanceStatus(session);
    if (!next) return;
    this.svc.update(session.id, { statut: next }).subscribe(() => this.load());
  }

  statusLabel(s: Session['statut']): string {
    const labels: Record<Session['statut'], string> = {
      'planifiee': 'Planifiée',
      'en-cours': 'En cours',
      'terminee': 'Terminée',
      'deliberee': 'Délibérée'
    };
    return labels[s];
  }

  nextStatusLabel(s: Session['statut']): string {
    const labels: Record<Session['statut'], string> = {
      'planifiee': '▶ Démarrer',
      'en-cours': '✔ Terminer',
      'terminee': '⚖ Délibérer',
      'deliberee': ''
    };
    return labels[s];
  }

  statusClass(s: Session['statut']): string {
    const map: Record<Session['statut'], string> = {
      'planifiee': 'badge-info',
      'en-cours': 'badge-warning',
      'terminee': 'badge-success',
      'deliberee': 'badge-purple'
    };
    return map[s];
  }
}
