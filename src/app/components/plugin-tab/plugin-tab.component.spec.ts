import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginTabComponent } from './plugin-tab.component';

describe('PluginTabComponent', () => {
    let component: PluginTabComponent;
    let fixture: ComponentFixture<PluginTabComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PluginTabComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(PluginTabComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
