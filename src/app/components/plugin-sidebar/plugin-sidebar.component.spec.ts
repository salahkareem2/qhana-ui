import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginSidebarComponent } from './plugin-sidebar.component';

describe('PluginSidebarComponent', () => {
    let component: PluginSidebarComponent;
    let fixture: ComponentFixture<PluginSidebarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PluginSidebarComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(PluginSidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
