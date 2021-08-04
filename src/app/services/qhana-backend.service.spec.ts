import { TestBed } from '@angular/core/testing';
import { QhanaBackendService } from './qhana-backend.service';


describe('QhanaBackendService', () => {
    let service: QhanaBackendService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(QhanaBackendService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
