import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimelineSubstepsComponent } from './timeline-substeps.component';


describe('TimelineSubstepsComponent', () => {
    let component: TimelineSubstepsComponent;
    let fixture: ComponentFixture<TimelineSubstepsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TimelineSubstepsComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TimelineSubstepsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
