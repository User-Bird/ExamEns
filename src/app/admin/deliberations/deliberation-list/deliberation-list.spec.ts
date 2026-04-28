import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliberationList } from './deliberation-list';

describe('DeliberationList', () => {
  let component: DeliberationList;
  let fixture: ComponentFixture<DeliberationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliberationList],
    }).compileComponents();

    fixture = TestBed.createComponent(DeliberationList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
