import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeUiTemplateDialog } from './change-ui-template.dialog';

describe('ChangeUiTemplateDialog', () => {
    let component: ChangeUiTemplateDialog;
    let fixture: ComponentFixture<ChangeUiTemplateDialog>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChangeUiTemplateDialog]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ChangeUiTemplateDialog);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
