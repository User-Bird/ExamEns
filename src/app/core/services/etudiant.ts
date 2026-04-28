import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Etudiant } from '../../models/index';

@Injectable({ providedIn: 'root' })
export class EtudiantService {
  private http = inject(HttpClient);
  private API = 'http://localhost:3000';

  getAll(): Observable<Etudiant[]> {
    return this.http.get<Etudiant[]>(`${this.API}/etudiants`);
  }

  getById(id: number): Observable<Etudiant> {
    return this.http.get<Etudiant>(`${this.API}/etudiants/${id}`);
  }

  getByFiliere(filiereId: number): Observable<Etudiant[]> {
    return this.http.get<Etudiant[]>(`${this.API}/etudiants?liereId=${filiereId}`);
  }

  getBySemestre(semestreId: number): Observable<Etudiant[]> {
    return this.http.get<Etudiant[]>(`${this.API}/etudiants?semestreId=${semestreId}`);
  }
}
