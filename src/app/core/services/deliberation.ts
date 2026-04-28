import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Deliberation, Decision, Mention, Note, Module, Examen, Etudiant } from '../../models/index';

@Injectable({ providedIn: 'root' })
export class DeliberationService {
  private http = inject(HttpClient);
  private API = 'http://localhost:3000';

  getBySession(sessionId: number): Observable<Deliberation[]> {
    return this.http.get<Deliberation[]>(`${this.API}/deliberations?sessionId=${sessionId}`);
  }

  getByEtudiant(etudiantId: number): Observable<Deliberation[]> {
    return this.http.get<Deliberation[]>(`${this.API}/deliberations?etudiantId=${etudiantId}`);
  }

  deleteBySession(sessionId: number): Observable<void[]> {
    return this.getBySession(sessionId).pipe(
      map(delibs => delibs.map(d => d.id)),
      map(ids => ids.map(id =>
        this.http.delete<void>(`${this.API}/deliberations/${id}`)
      ) as any)
    );
  }

  saveDeliberation(delib: Omit<Deliberation, 'id'>): Observable<Deliberation> {
    return this.http.post<Deliberation>(`${this.API}/deliberations`, delib);
  }

  /** Main calculation: loads all needed data then computes deliberations */
  calculerEtSauvegarder(sessionId: number): Observable<Deliberation[]> {
    return forkJoin({
      etudiants: this.http.get<Etudiant[]>(`${this.API}/etudiants`),
      examens:   this.http.get<Examen[]>(`${this.API}/examens?sessionId=${sessionId}`),
      modules:   this.http.get<Module[]>(`${this.API}/modules`),
      notes:     this.http.get<Note[]>(`${this.API}/notes`),
      existing:  this.getBySession(sessionId),
    }).pipe(
      map(({ etudiants, examens, modules, notes, existing }) => {
        // Delete existing first (we'll handle this via separate calls in component)
        const results: Omit<Deliberation, 'id'>[] = [];

        for (const etudiant of etudiants) {
          let sommeNotes = 0;
          let sommeCoefs = 0;
          let modulesNonValides = 0;
          let modulesSous5 = 0;

          for (const examen of examens) {
            const module = modules.find(m => m.id === examen.moduleId);
            if (!module) continue;

            const note = notes.find(n => n.examenId === examen.id && n.etudiantId === etudiant.id);
            if (!note) continue;

            const coef = module.coefficient ?? 1;
            sommeNotes += note.noteFinale * coef;
            sommeCoefs += coef;

            if (note.noteFinale < 10) modulesNonValides++;
            if (note.noteFinale < 5)  modulesSous5++;
          }

          const moyenne = sommeCoefs > 0
            ? Math.round((sommeNotes / sommeCoefs) * 100) / 100
            : 0;

          // Decision logic from TP spec
          let decision: Decision;
          if (modulesSous5 > 0)        decision = 'ajourne';
          else if (moyenne >= 10)       decision = 'valide';
          else if (modulesNonValides <= 2) decision = 'rattrapage';
          else                          decision = 'ajourne';

          // Mention only if validated
          let mention: Mention = 'aucune';
          if (decision === 'valide') {
            if (moyenne >= 16)      mention = 'tres-bien';
            else if (moyenne >= 14) mention = 'bien';
            else if (moyenne >= 12) mention = 'assez-bien';
            else                    mention = 'passable';
          }

          results.push({
            etudiantId: etudiant.id,
            sessionId,
            moyenne,
            decision,
            mention,
            modulesNonValides,
            modulesSous5,
            rang: 0,
          });
        }

        // Ranking: sort by moyenne desc, assign rank
        results.sort((a, b) => b.moyenne - a.moyenne);
        results.forEach((r, i) => r.rang = i + 1);

        return results as Deliberation[];
      })
    );
  }
}
