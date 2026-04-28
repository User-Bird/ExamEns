import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotesModule } from './notes-module';

describe('NotesModule', () => {
  let component: NotesModule;
  let fixture: ComponentFixture<NotesModule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotesModule],
    }).compileComponents();

    fixture = TestBed.createComponent(NotesModule);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
