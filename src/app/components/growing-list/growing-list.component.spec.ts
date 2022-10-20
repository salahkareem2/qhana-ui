import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrowingListComponent } from './growing-list.component';

describe('GrowingListComponent', () => {
    let component: GrowingListComponent;
    let fixture: ComponentFixture<GrowingListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GrowingListComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(GrowingListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
