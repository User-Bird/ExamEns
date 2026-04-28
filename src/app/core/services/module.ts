import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Module } from '../../models/index';

@Injectable({ providedIn: 'root' })
export class ModuleService {
  private http = inject(HttpClient);
  private API = 'http://localhost:3000';

  getAll(): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.API}/modules`);
  }

  getById(id: number): Observable<Module> {
    return this.http.get<Module>(`${this.API}/modules/${id}`);
  }

  getBySemestre(semestreId: number): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.API}/modules?semestreId=${semestreId}`);
  }

  getByEnseignant(enseignantId: number): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.API}/modules?enseignantId=${enseignantId}`);
  }
}
