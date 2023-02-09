import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'qhana-export-experiment',
    templateUrl: './export-experiment.component.html',
    styleUrls: ['./export-experiment.component.sass']
})
export class ExportExperimentDialog implements OnInit {

    configTest: string = "";

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
