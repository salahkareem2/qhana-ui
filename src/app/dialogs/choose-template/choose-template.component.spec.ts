import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseTemplateComponent } from './choose-template.component';

describe('ChooseTemplateDialog', () => {
  let component: ChooseTemplateComponent;
  let fixture: ComponentFixture<ChooseTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChooseTemplateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
