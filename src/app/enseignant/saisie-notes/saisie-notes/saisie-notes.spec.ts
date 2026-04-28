import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaisieNotes } from './saisie-notes';

describe('SaisieNotes', () => {
  let component: SaisieNotes;
  let fixture: ComponentFixture<SaisieNotes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaisieNotes],
    }).compileComponents();

    fixture = TestBed.createComponent(SaisieNotes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
