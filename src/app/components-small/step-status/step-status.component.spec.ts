import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepStatusComponent } from './step-status.component';

describe('StepStatusComponent', () => {
  let component: StepStatusComponent;
  let fixture: ComponentFixture<StepStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StepStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StepStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
