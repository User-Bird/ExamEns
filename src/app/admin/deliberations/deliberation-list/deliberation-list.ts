import { Component, inject, signal, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { switchMap, concatMap, toArray } from 'rxjs/operators';
import { from } from 'rxjs';
import { DecisionLabelPipe } from '../../../pipes/decision-label-pipe';
import { DecisionColorPipe } from '../../../pipes/decision-color-pipe';
import { MentionPipe } from '../../../pipes/mention-pipe';
import { NoteFormatPipe } from '../../../pipes/note-format-pipe';
import { DeliberationService } from '../../../core/services/deliberation';
import { SessionService } from '../../../core/services/session';
import { EtudiantService } from '../../../core/services/etudiant';
import { Deliberation, Session, Etudiant } from '../../../models/index';

@Component({
  selector: 'app-deliberation-list',
  imports: [DecisionLabelPipe, DecisionColorPipe, MentionPipe, NoteFormatPipe],
  templateUrl: './deliberation-list.html',
  styleUrl: './deliberation-list.scss'
})
export class DeliberationList implements OnInit {
  private deliberationSvc = inject(DeliberationService);
  private sessionSvc      = inject(SessionService);
  private etudiantSvc     = inject(EtudiantService);

  sessions      = signal<Session[]>([]);
  deliberations = signal<Deliberation[]>([]);
  etudiants     = signal<Etudiant[]>([]);
  selectedSessionId = signal<number | null>(null);

  loading   = signal(false);
  computing = signal(false);
  error     = signal('');
  success   = signal('');

  ngOnInit() {
    forkJoin({
      sessions:  this.sessionSvc.getAll(),
      etudiants: this.etudiantSvc.getAll(),
    }).subscribe({
      next: ({ sessions, etudiants }) => {
        this.sessions.set(sessions);
        this.etudiants.set(etudiants);
        // Auto-select the first "terminee" session
        const terminee = sessions.find(s => s.statut === 'terminee' || s.statut === 'deliberee');
        if (terminee) this.selectSession(terminee.id);
      },
      error: () => this.error.set('Erreur de chargement des données')
    });
  }

  selectSession(sessionId: number) {
    this.selectedSessionId.set(sessionId);
    this.loading.set(true);
    this.deliberationSvc.getBySession(sessionId).subscribe({
      next: (data) => { this.deliberations.set(data); this.loading.set(false); },
      error: () => { this.error.set('Erreur chargement délibérations'); this.loading.set(false); }
    });
  }

  lancerDeliberation() {
    const sessionId = this.selectedSessionId();
    if (!sessionId) return;
    if (!confirm('Lancer le calcul des délibérations pour cette session ?')) return;

    this.computing.set(true);
    this.error.set('');
    this.success.set('');

    // 1. Calculate all deliberations
    this.deliberationSvc.calculerEtSauvegarder(sessionId).pipe(
      switchMap(results => {
        // 2. Delete existing deliberations for this session first
        return this.deliberationSvc.getBySession(sessionId).pipe(
          switchMap(existing => {
            if (existing.length === 0) return from([results]);
            return from(existing).pipe(
              concatMap(d =>
                (this.deliberationSvc as any).http
                  ? (this.deliberationSvc as any).http.delete(`http://localhost:3000/deliberations/${d.id}`)
                  : from([null])
              ),
              toArray(),
              switchMap(() => from([results]))
            );
          })
        );
      }),
      switchMap((results: any) => {
        // 3. Save all new deliberations
        return from(results as Omit<Deliberation, 'id'>[]).pipe(
          concatMap(d => this.deliberationSvc.saveDeliberation(d)),
          toArray()
        );
      })
    ).subscribe({
      next: (saved) => {
        this.deliberations.set(saved);
        this.computing.set(false);
        this.success.set(`✅ ${saved.length} délibérations calculées et enregistrées !`);
        // Update session status to 'deliberee'
        this.sessionSvc.update(sessionId, { statut: 'deliberee' }).subscribe();
      },
      error: (err) => {
        this.error.set('Erreur lors du calcul des délibérations');
        this.computing.set(false);
        console.error(err);
      }
    });
  }

  getEtudiantNom(etudiantId: number): string {
    const e = this.etudiants().find(e => e.id === etudiantId);
    return e ? `${e.nom} ${e.prenom}` : `Étudiant #${etudiantId}`;
  }

  getDecisionClass(decision: string): string {
    const map: Record<string, string> = {
      'valide':    'badge-success',
      'rattrapage':'badge-warning',
      'ajourne':   'badge-danger',
      'exclu':     'badge-dark'
    };
    return map[decision] ?? '';
  }
}
