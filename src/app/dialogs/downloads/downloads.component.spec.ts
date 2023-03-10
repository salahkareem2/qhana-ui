import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadsDialog } from './downloads.component';

describe('DownloadsDialog', () => {
    let component: DownloadsDialog;
    let fixture: ComponentFixture<DownloadsDialog>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DownloadsDialog]
        })
            .compileComponents();

        fixture = TestBed.createComponent(DownloadsDialog);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
