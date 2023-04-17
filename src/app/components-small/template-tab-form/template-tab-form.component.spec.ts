import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateTabFormComponent } from './template-tab-form.component';

describe('TemplateTabFormComponent', () => {
    let component: TemplateTabFormComponent;
    let fixture: ComponentFixture<TemplateTabFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TemplateTabFormComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(TemplateTabFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
