import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperimentTimelineComponent } from './experiment-timeline.component';

describe('ExperimentTimelineComponent', () => {
  let component: ExperimentTimelineComponent;
  let fixture: ComponentFixture<ExperimentTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExperimentTimelineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
