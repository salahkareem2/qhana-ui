import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { interval, Observable } from 'rxjs';
import { filter, startWith, switchMap, take } from 'rxjs/operators';
import { ExperimentImportApiObject, QhanaBackendService } from 'src/app/services/qhana-backend.service';

@Component({
    selector: 'qhana-import-experiment',
    templateUrl: './import-experiment.component.html',
    styleUrls: ['./import-experiment.component.sass']
})
export class ImportExperimentDialog implements OnInit {

    // TODO: add real config vars once backend includes functionality
    @ViewChild('file') file: any;
    addedFile: File | undefined;
    progress: number = 0;
    uploadStatus: "PENDING" | "DONE" | "FAILURE" | "OTHER" | "NOT_STARTED" = "NOT_STARTED";
    polling: "NOT_STARTED" | "PENDING" | "DONE" = "NOT_STARTED";
    pollingResult: string = "";
    uploading: boolean = false;
    error: string | undefined;
    waiting: boolean = false;

    constructor(public dialogRef: MatDialogRef<ImportExperimentDialog>, private backend: QhanaBackendService, @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit(): void {
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onOk(): void {
        this.dialogRef.close();
    }

    addFile() {
        this.file.nativeElement.click();
    }

    onFileAdded() {
        this.reset();
        const files: File[] = this.file.nativeElement.files;
        for (let file of files) {
            this.addedFile = file;
        }
    }

    import() {
        if (!this.addedFile) {
            console.error("No file specified!");
            return;
        }

        this.uploading = true;
        // start experiment import
        this.backend.importExperiment(this.addedFile)
            .pipe(
                filter(resp => {
                    if (resp.uploadStatus == "PENDING" || resp.uploadStatus == "DONE") {
                        this.progress = resp.progress;
                        this.uploadStatus = resp.uploadStatus;
                        return resp.uploadStatus == "DONE";
                    } else {
                        return false;
                    }
                }),
                take(1)
            )
            .subscribe(experimentUpload => {
                this.pollForImportResult(experimentUpload.importId)
            })
    }

    pollForImportResult(importId: number | undefined) {
        if (importId) {
            // File upload complete. Poll for result.
            const importIdNr: number = importId;
            this.polling = "PENDING";
            this.uploading = false;
            interval(1000)
                .pipe(
                    startWith(0),
                    switchMap(() => this.backend.importExperimentPoll(importIdNr)),
                    filter(resp => resp.status != "PENDING"),
                    take(1)
                )
                .subscribe(resp => {
                    if (resp.status == "SUCCESS") {
                        // close dialog after wait
                        this.polling = "DONE"
                        this.pollingResult = "Import successful. Forwarding to experiment...";
                        this.waiting = true;
                        setTimeout(() => this.dialogRef.close({ experimentId: resp.experimentId }), 2000);
                    } else {
                        if (resp.status == "FAILURE") {
                            console.error("Something went wrong. Check errors at backend.")
                        } else {
                            console.error("Something went wrong. Backend returned wrong import status. Please check errors at backend.");
                        }
                        this.polling = "DONE";
                        this.error = "Something went wrong.";
                    }
                })
        } else {
            console.error("Something went wrong. Could not retrieve importId. Please check errors at backend.");
            this.error = "Something went wrong.";
        }
    }

    reset() {
        this.waiting = false;
        this.error = undefined;
        this.progress = 0;
        this.uploadStatus = "NOT_STARTED";
        this.polling = "NOT_STARTED";
    }
}
