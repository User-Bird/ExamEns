import { TestBed } from '@angular/core/testing';

import { Examen } from './examen';

describe('Examen', () => {
  let service: Examen;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Examen);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
