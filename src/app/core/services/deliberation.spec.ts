import { TestBed } from '@angular/core/testing';

import { Deliberation } from './deliberation';

describe('Deliberation', () => {
  let service: Deliberation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Deliberation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
