import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChooseDataDialog } from './choose-data.dialog';


describe('ChooseDataDialog', () => {
    let component: ChooseDataDialog;
    let fixture: ComponentFixture<ChooseDataDialog>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChooseDataDialog]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChooseDataDialog);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
