import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperimentWorkspaceComponent } from './experiment-workspace.component';

describe('ExperimentWorkspaceComponent', () => {
  let component: ExperimentWorkspaceComponent;
  let fixture: ComponentFixture<ExperimentWorkspaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExperimentWorkspaceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
