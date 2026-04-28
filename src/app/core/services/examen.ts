import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Examen } from '../../models/index';

@Injectable({ providedIn: 'root' })
export class ExamenService {
  private http = inject(HttpClient);
  private API = 'http://localhost:3000';

  getAll(): Observable<Examen[]> {
    return this.http.get<Examen[]>(`${this.API}/examens`);
  }

  getById(id: number): Observable<Examen> {
    return this.http.get<Examen>(`${this.API}/examens/${id}`);
  }

  getBySession(sessionId: number): Observable<Examen[]> {
    return this.http.get<Examen[]>(`${this.API}/examens?sessionId=${sessionId}`);
  }

  getByModule(moduleId: number): Observable<Examen[]> {
    return this.http.get<Examen[]>(`${this.API}/examens?moduleId=${moduleId}`);
  }

  create(examen: Omit<Examen, 'id'>): Observable<Examen> {
    return this.http.post<Examen>(`${this.API}/examens`, examen);
  }

  update(id: number, examen: Partial<Examen>): Observable<Examen> {
    return this.http.patch<Examen>(`${this.API}/examens/${id}`, examen);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/examens/${id}`);
  }
}
