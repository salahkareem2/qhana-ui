import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateExperimentDialog } from './create-experiment.dialog';


describe('CreateExperimentComponent', () => {
    let component: CreateExperimentDialog;
    let fixture: ComponentFixture<CreateExperimentDialog>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreateExperimentDialog]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateExperimentDialog);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
