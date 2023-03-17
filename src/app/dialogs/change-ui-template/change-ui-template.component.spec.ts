import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeUiTemplateComponent } from './change-ui-template.component';

describe('ChangeUiTemplateComponent', () => {
    let component: ChangeUiTemplateComponent;
    let fixture: ComponentFixture<ChangeUiTemplateComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChangeUiTemplateComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ChangeUiTemplateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
