import { Component, inject, signal, OnInit } from '@angular/core';
import { forkJoin, from } from 'rxjs';
import { concatMap, toArray } from 'rxjs/operators';
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

  sessions          = signal<Session[]>([]);
  deliberations     = signal<Deliberation[]>([]);
  etudiants         = signal<Etudiant[]>([]);
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
        const terminee = sessions.find(s => s.statut === 'terminee' || s.statut === 'deliberee');
        if (terminee) this.selectSession(terminee.id);
      },
      error: () => this.error.set('Erreur de chargement')
    });
  }

  selectSession(sessionId: number) {
    this.selectedSessionId.set(sessionId);
    this.loading.set(true);
    this.deliberationSvc.getBySession(sessionId).subscribe({
      next: (data) => { this.deliberations.set(data); this.loading.set(false); },
      error: () => { this.error.set('Erreur chargement'); this.loading.set(false); }
    });
  }

  lancerDeliberation() {
    const sessionId = this.selectedSessionId();
    if (!sessionId) return;
    if (!confirm('Lancer le calcul des délibérations ?')) return;

    this.computing.set(true);
    this.error.set('');
    this.success.set('');

    // Step 1: calculate results
    this.deliberationSvc.calculerResultats(sessionId).subscribe({
      next: (results) => {
        // Step 2: delete existing then save new ones
        this.deliberationSvc.getBySession(sessionId).subscribe({
          next: (existing) => {
            const deleteAll$ = existing.length > 0
              ? from(existing).pipe(
                concatMap(d => this.deliberationSvc.deleteDeliberation(d.id)),
                toArray()
              )
              : from([[]]);

            deleteAll$.subscribe(() => {
              // Step 3: save all new results
              from(results).pipe(
                concatMap(d => this.deliberationSvc.saveDeliberation(d)),
                toArray()
              ).subscribe({
                next: (saved) => {
                  this.deliberations.set(saved);
                  this.computing.set(false);
                  this.success.set(`✅ ${saved.length} délibérations enregistrées !`);
                  this.sessionSvc.update(sessionId, { statut: 'deliberee' }).subscribe();
                },
                error: () => { this.error.set('Erreur sauvegarde'); this.computing.set(false); }
              });
            });
          }
        });
      },
      error: () => { this.error.set('Erreur calcul'); this.computing.set(false); }
    });
  }

  getEtudiantNom(etudiantId: number): string {
    const e = this.etudiants().find(e => e.id === etudiantId);
    return e ? `${e.nom} ${e.prenom}` : `Étudiant #${etudiantId}`;
  }

  getDecisionClass(decision: string): string {
    const map: Record<string, string> = {
      'valide':     'badge-success',
      'rattrapage': 'badge-warning',
      'ajourne':    'badge-danger',
      'exclu':      'badge-dark'
    };
    return map[decision] ?? '';
  }
}
