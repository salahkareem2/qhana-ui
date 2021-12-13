import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChooseDataComponent } from './choose-data.component';


describe('ChooseDataComponent', () => {
    let component: ChooseDataComponent;
    let fixture: ComponentFixture<ChooseDataComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChooseDataComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChooseDataComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
