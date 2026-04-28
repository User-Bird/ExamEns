import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamenForm } from './examen-form';

describe('ExamenForm', () => {
  let component: ExamenForm;
  let fixture: ComponentFixture<ExamenForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamenForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ExamenForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
