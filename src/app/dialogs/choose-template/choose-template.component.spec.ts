import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseTemplateDialog } from './choose-template.component';

describe('ChooseTemplateDialog', () => {
  let component: ChooseTemplateDialog;
  let fixture: ComponentFixture<ChooseTemplateDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChooseTemplateDialog ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseTemplateDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
