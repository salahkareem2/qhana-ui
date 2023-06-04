import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportExperimentComponent } from './import-experiment.component';

describe('ComponentsSmall.ImportExperimentComponent', () => {
    let component: ImportExperimentComponent;
    let fixture: ComponentFixture<ImportExperimentComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ImportExperimentComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ImportExperimentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
