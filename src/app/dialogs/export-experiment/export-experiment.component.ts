import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QhanaBackendService } from 'src/app/services/qhana-backend.service';

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

    constructor(public dialogRef: MatDialogRef<ExportExperimentDialog>, @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit(): void {
        this.backend = this.data.backend;
        this.experimentId = this.data.experimentId;
    }

    onExport() {
        this.downloading = true;
        // check input data // TODO: add once config vars in backend are added
        // if (this.configTest == null || this.configTest === "") {
        //     // TODO
        //     console.error("Incorrect export config!", this.configTest);
        // }
        if (this.experimentId == null || this.backend == null) {
            // should never happen
            console.log("Experiment id or backend not set correctly.");
            this.error = "Something went wrong. Please try again later or look at the logs.";
            return
        }
        this.backend.exportExperiment(this.experimentId, this.configTest).subscribe(resp => {
            this.downloading = false;
            if (resp.status == "SUCCESS") {
                if (resp.fileLink != undefined) {
                    this.downloadLink = resp.fileLink;
                } else {
                    // should not happen
                    console.log("Error in export experiment poll result handling.");
                    this.error = "Something went wrong. Please try again later or look at the logs.";
                }
            } else if (resp.status == "FAILURE") {
                console.log("Something went wrong in polling the result for experiment export.");
                this.error = "Something went wrong in the backend. Please try again later or look at the logs.";
            }
        });
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onOk(): void {
        this.dialogRef.close();
    }
}
