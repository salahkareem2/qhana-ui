import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'qhana-export-experiment',
  templateUrl: './export-experiment.component.html',
  styleUrls: ['./export-experiment.component.sass']
})
export class ExportExperimentDialog implements OnInit {

  // TODO: add real config vars once backend includes functionality
  configTest: string = "";
  error: string | undefined;

  constructor(public dialogRef: MatDialogRef<ExportExperimentDialog>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onOk(): void {
    this.dialogRef.close();
  }
}
