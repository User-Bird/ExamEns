// src/app/models/filiere.model.ts
export interface Filiere {
  id: number;
  nom: string;
  code: string;
  cycle: string;
}

// src/app/models/semestre.model.ts
export interface Semestre {
  id: number;
  nom: string;
  filiereId: number;
  annee: string;
  actif: boolean;
}

// src/app/models/module.model.ts
export interface Module {
  id: number;
  nom: string;
  code: string;
  semestreId: number;
  enseignantId: number;
  coefficient: number;
  hasCC: boolean;
}

// src/app/models/user.model.ts
export type UserRole = 'admin' | 'enseignant' | 'etudiant';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  role: UserRole;
  etudiantId?: number;
}

// src/app/models/etudiant.model.ts
export interface Etudiant {
  id: number;
  nom: string;
  prenom: string;
  cne: string;
  cin: string;
  filiereId: number;
  semestreId: number;
  groupe: string;
}

// src/app/models/session.model.ts
export type SessionType = 'normale' | 'rattrapage';
export type SessionStatut = 'planifiee' | 'en-cours' | 'terminee' | 'deliberee';

export interface Session {
  id: number;
  semestreId: number;
  type: SessionType;
  dateDebut: string;
  dateFin: string;
  statut: SessionStatut;
}

// src/app/models/examen.model.ts
export interface Examen {
  id: number;
  moduleId: number;
  sessionId: number;
  date: string;
  duree: number;
  salle: string;
}

// src/app/models/note.model.ts
export interface Note {
  id: number;
  examenId: number;
  etudiantId: number;
  noteCC?: number;       // 0-20, optional
  noteExamen: number;    // 0-20
  noteFinale: number;    // Calculated: CC*0.3 + Exam*0.7
  absent: boolean;
}

// src/app/models/deliberation.model.ts
export type Decision = 'valide' | 'rattrapage' | 'ajourne' | 'exclu';
export type Mention = 'passable' | 'assez-bien' | 'bien' | 'tres-bien' | 'aucune';

export interface Deliberation {
  id: number;
  etudiantId: number;
  sessionId: number;
  moyenne: number;
  decision: Decision;
  mention: Mention;
  rang: number;
  modulesNonValides: number;
  modulesSous5: number;
  observations?: string;
}
