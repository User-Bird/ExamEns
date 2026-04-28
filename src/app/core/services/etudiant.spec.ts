import { TestBed } from '@angular/core/testing';

import { Etudiant } from './etudiant';

describe('Etudiant', () => {
  let service: Etudiant;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Etudiant);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
