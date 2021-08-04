import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExperimentsPageComponent } from './experiments-page.component';


describe('ExperimentsPageComponent', () => {
    let component: ExperimentsPageComponent;
    let fixture: ComponentFixture<ExperimentsPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ExperimentsPageComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ExperimentsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
