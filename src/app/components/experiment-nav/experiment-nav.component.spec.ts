import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperimentNavComponent } from './experiment-nav.component';

describe('ExperimentNavComponent', () => {
  let component: ExperimentNavComponent;
  let fixture: ComponentFixture<ExperimentNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExperimentNavComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
