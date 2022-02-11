import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PluginUiframeComponent } from './plugin-uiframe.component';


describe('PluginUiframeComponent', () => {
    let component: PluginUiframeComponent;
    let fixture: ComponentFixture<PluginUiframeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PluginUiframeComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PluginUiframeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
