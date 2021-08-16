import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimelineStepComponent } from './timeline-step.component';


describe('TimelineStepComponent', () => {
    let component: TimelineStepComponent;
    let fixture: ComponentFixture<TimelineStepComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TimelineStepComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TimelineStepComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
