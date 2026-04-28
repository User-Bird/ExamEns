import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Examen } from '../../models/index';

@Injectable({ providedIn: 'root' })
export class ExamenService {
  private http = inject(HttpClient);
  private API = 'http://localhost:3000/examens';

  getAll(): Observable<Examen[]> {
    return this.http.get<Examen[]>(this.API);
  }

  // Needed for T5: Get exams for a specific module in a specific session
  getByModuleAndSession(moduleId: number, sessionId: number): Observable<Examen[]> {
    return this.http.get<Examen[]>(`${this.API}?moduleId=${moduleId}&sessionId=${sessionId}`);
  }

  create(examen: Omit<Examen, 'id'>): Observable<Examen> {
    return this.http.post<Examen>(this.API, examen);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  // Add this to your ExamenService in src/app/core/services/examen.ts

  getBySession(sessionId: number): Observable<Examen[]> {
    return this.http.get<Examen[]>(`${this.API}?sessionId=${sessionId}`);
  }

  getById(id: number): Observable<Examen> {
    return this.http.get<Examen>(`${this.API}/${id}`);
  }

  update(id: number, examen: Partial<Examen>): Observable<Examen> {
    return this.http.patch<Examen>(`${this.API}/${id}`, examen);
  }
}
