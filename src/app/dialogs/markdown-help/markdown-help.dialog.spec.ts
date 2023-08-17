import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarkdownHelpDialog } from './markdown-help.dialog';


describe('MarkdownHelpComponent', () => {
    let component: MarkdownHelpDialog;
    let fixture: ComponentFixture<MarkdownHelpDialog>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MarkdownHelpDialog]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MarkdownHelpDialog);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
