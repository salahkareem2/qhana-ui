import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PluginUiComponent } from './plugin-ui.component';


describe('PluginUiComponent', () => {
    let component: PluginUiComponent;
    let fixture: ComponentFixture<PluginUiComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PluginUiComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PluginUiComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
