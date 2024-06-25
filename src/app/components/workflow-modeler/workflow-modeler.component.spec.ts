import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowModelerComponent } from './workflow-modeler.component';

describe('WorkflowModelerComponent', () => {
  let component: WorkflowModelerComponent;
  let fixture: ComponentFixture<WorkflowModelerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowModelerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkflowModelerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
