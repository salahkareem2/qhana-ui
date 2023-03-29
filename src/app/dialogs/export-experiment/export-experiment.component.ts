import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QhanaBackendService } from 'src/app/services/qhana-backend.service';

interface SelectValue {
    value: string | boolean;
    viewValue: string;
}

@Component({
    selector: 'qhana-export-experiment',
    templateUrl: './export-experiment.component.html',
    styleUrls: ['./export-experiment.component.sass']
})
export class ExportExperimentDialog implements OnInit {

    private backend: QhanaBackendService | null = null;
    private experimentId: string | null = null;

    configTest: string = "";
    downloading: boolean = false;
    error: string | null = null;
    downloadLink: string | undefined;

    configRestriction: "ALL" | "LOGS" | "DATA" | "STEPS" = "ALL";
    restrictionValues: SelectValue[] = [
        { value: "ALL", viewValue: "Complete experiment" },
        { value: "LOGS", viewValue: "Only timeline steps/substeps (no data files)" },
        { value: "DATA", viewValue: "Only data files" },
        { value: "STEPS", viewValue: "List of steps" }
    ];

    allDataVersions: boolean = true;
    allDataVersionsValues: SelectValue[] = [
        { value: true, viewValue: "All data versions" },
        { value: false, viewValue: "Only newest data version" }
    ];

    stepList: number[] = [];

    constructor(public dialogRef: MatDialogRef<ExportExperimentDialog>, @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit(): void {
        this.backend = this.data.backend;
        this.experimentId = this.data.experimentId;
    }

    onExport() {
        this.downloading = true;
        if (this.experimentId == null || this.backend == null) {
            // should never happen
            console.log("Experiment id or backend not set correctly.");
            return;
        }
        this.backend.exportExperiment(this.experimentId, this.configRestriction, this.allDataVersions, this.stepList).subscribe(resp => {
            this.downloading = false;
            if (resp.status == "SUCCESS") {
                if (resp.fileLink == undefined) {
                    // should not happen
                    console.log("Error in export experiment poll result handling.");
                }
            } else if (resp.status == "FAILURE") {
                console.log("Something went wrong in polling the result for experiment export.");
            }
        });
        this.dialogRef.close();
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
