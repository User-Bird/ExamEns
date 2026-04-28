import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamenList } from './examen-list';

describe('ExamenList', () => {
  let component: ExamenList;
  let fixture: ComponentFixture<ExamenList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamenList],
    }).compileComponents();

    fixture = TestBed.createComponent(ExamenList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
