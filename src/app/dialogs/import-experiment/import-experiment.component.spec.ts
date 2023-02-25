import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportExperimentDialog } from './import-experiment.component';

describe('ImportExperimentComponent', () => {
    let component: ImportExperimentDialog;
    let fixture: ComponentFixture<ImportExperimentDialog>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ImportExperimentDialog]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ImportExperimentDialog);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
