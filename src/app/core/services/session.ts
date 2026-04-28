import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Session } from '../../models/index';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private http = inject(HttpClient);
  private API = 'http://localhost:3000';

  getAll(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.API}/sessions`);
  }

  getById(id: number): Observable<Session> {
    return this.http.get<Session>(`${this.API}/sessions/${id}`);
  }

  getBySemestre(semestreId: number): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.API}/sessions?semestreId=${semestreId}`);
  }

  create(session: Omit<Session, 'id'>): Observable<Session> {
    return this.http.post<Session>(`${this.API}/sessions`, session);
  }

  update(id: number, session: Partial<Session>): Observable<Session> {
    return this.http.patch<Session>(`${this.API}/sessions/${id}`, session);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/sessions/${id}`);
  }

  advanceStatus(session: Session): Session['statut'] | null {
    const flow: Record<Session['statut'], Session['statut'] | null> = {
      'planifiee': 'en-cours',
      'en-cours': 'terminee',
      'terminee': 'deliberee',
      'deliberee': null
    };
    return flow[session.statut];
  }
}
