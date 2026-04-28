import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Note } from '../../models/index';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private http = inject(HttpClient);
  private API = 'http://localhost:3000';

  getAll(): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.API}/notes`);
  }

  getByExamen(examenId: number): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.API}/notes?examenId=${examenId}`);
  }

  getByEtudiant(etudiantId: number): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.API}/notes?etudiantId=${etudiantId}`);
  }

  getByExamenAndEtudiant(examenId: number, etudiantId: number): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.API}/notes?examenId=${examenId}&etudiantId=${etudiantId}`);
  }

  create(note: Omit<Note, 'id'>): Observable<Note> {
    return this.http.post<Note>(`${this.API}/notes`, note);
  }

  update(id: number, note: Partial<Note>): Observable<Note> {
    return this.http.patch<Note>(`${this.API}/notes/${id}`, note);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/notes/${id}`);
  }
}
