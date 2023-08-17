import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChoosePluginDialog } from './choose-plugin.dialog';


describe('ChoosePluginDialog', () => {
    let component: ChoosePluginDialog;
    let fixture: ComponentFixture<ChoosePluginDialog>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChoosePluginDialog]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChoosePluginDialog);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
