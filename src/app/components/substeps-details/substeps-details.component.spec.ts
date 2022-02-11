import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubstepsDetailsComponent } from './substeps-details.component';


describe('SubstepsDetailsComponent', () => {
    let component: SubstepsDetailsComponent;
    let fixture: ComponentFixture<SubstepsDetailsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SubstepsDetailsComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SubstepsDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
