import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginFilterEditorComponent } from './plugin-filter-editor.component';

describe('PluginFilterEditorComponent', () => {
  let component: PluginFilterEditorComponent;
  let fixture: ComponentFixture<PluginFilterEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PluginFilterEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PluginFilterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
