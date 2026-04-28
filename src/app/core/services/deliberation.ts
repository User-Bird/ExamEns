import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
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

  saveDeliberation(delib: Omit<Deliberation, 'id'>): Observable<Deliberation> {
    return this.http.post<Deliberation>(`${this.API}/deliberations`, delib);
  }

  deleteDeliberation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/deliberations/${id}`);
  }

  getAll(): Observable<Deliberation[]> {
    return this.http.get<Deliberation[]>(`${this.API}/deliberations`);
  }

  calculerResultats(sessionId: number): Observable<Omit<Deliberation, 'id'>[]> {
    return forkJoin({
      etudiants: this.http.get<Etudiant[]>(`${this.API}/etudiants`),
      examens:   this.http.get<Examen[]>(`${this.API}/examens?sessionId=${sessionId}`),
      modules:   this.http.get<Module[]>(`${this.API}/modules`),
      notes:     this.http.get<Note[]>(`${this.API}/notes`),
    }).pipe(
      map(({ etudiants, examens, modules, notes }) => {
          console.log('DEBUG', {
            etudiants: etudiants.length,
            examens: examens.length,
            modules: modules.length,
            notes: notes.length
          });
          console.log('First note:', notes[0]);
          console.log('First examen:', examens[0]);
        const results = etudiants.map(etudiant => {
          let sommeNotes = 0;
          let sommeCoefs = 0;
          let modulesNonValides = 0;
          let modulesSous5 = 0;

          examens.forEach(examen => {
            const module = modules.find(m => Number(m.id) === Number(examen.moduleId));
            if (!module) return;

            const note = notes.find(n =>
              Number(n.examenId) === Number(examen.id) && Number(n.etudiantId) === Number(etudiant.id)
            );
            if (!note) return;

            const coef = module.coefficient ?? 1;
            sommeNotes += note.noteFinale * coef;
            sommeCoefs += coef;

            if (note.noteFinale < 10) modulesNonValides++;
            if (note.noteFinale < 5)  modulesSous5++;
          });

          const moyenne = sommeCoefs > 0
            ? Math.round((sommeNotes / sommeCoefs) * 100) / 100
            : 0;

          let decision: Decision;
          if (modulesSous5 > 0)            decision = 'ajourne';
          else if (moyenne >= 10)          decision = 'valide';
          else if (modulesNonValides <= 2) decision = 'rattrapage';
          else                             decision = 'ajourne';

          let mention: Mention = 'aucune';
          if (decision === 'valide') {
            if (moyenne >= 16)      mention = 'tres-bien';
            else if (moyenne >= 14) mention = 'bien';
            else if (moyenne >= 12) mention = 'assez-bien';
            else                    mention = 'passable';
          }

          return {
            etudiantId: etudiant.id,
            sessionId,
            moyenne,
            decision,
            mention,
            modulesNonValides,
            modulesSous5,
            rang: 0,
          } as Omit<Deliberation, 'id'>;
        });

        // Sort and assign ranks
        results.sort((a, b) => b.moyenne - a.moyenne);
        results.forEach((r, i) => r.rang = i + 1);

        return results;
      }
      )
    );
  }
}
