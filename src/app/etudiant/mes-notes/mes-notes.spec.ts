import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesNotes } from './mes-notes';

describe('MesNotes', () => {
  let component: MesNotes;
  let fixture: ComponentFixture<MesNotes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesNotes],
    }).compileComponents();

    fixture = TestBed.createComponent(MesNotes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
