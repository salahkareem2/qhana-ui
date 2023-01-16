import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportExperimentDialog } from './export-experiment.component';

describe('ExportExperimentComponent', () => {
  let component: ExportExperimentDialog;
  let fixture: ComponentFixture<ExportExperimentDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExportExperimentDialog]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ExportExperimentDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
