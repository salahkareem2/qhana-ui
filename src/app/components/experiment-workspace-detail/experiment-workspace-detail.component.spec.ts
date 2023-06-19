import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperimentWorkspaceDetailComponent } from './experiment-workspace-detail.component';

describe('ExperimentWorkspaceDetailComponent', () => {
  let component: ExperimentWorkspaceDetailComponent;
  let fixture: ComponentFixture<ExperimentWorkspaceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExperimentWorkspaceDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperimentWorkspaceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
