import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChoosePluginComponent } from './choose-plugin.component';


describe('ChoosePluginComponent', () => {
    let component: ChoosePluginComponent;
    let fixture: ComponentFixture<ChoosePluginComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChoosePluginComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChoosePluginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
