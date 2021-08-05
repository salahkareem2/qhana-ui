import { TestBed } from '@angular/core/testing';
import { CurrentExperimentService } from './current-experiment.service';


describe('CurrentExperimentService', () => {
    let service: CurrentExperimentService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CurrentExperimentService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
