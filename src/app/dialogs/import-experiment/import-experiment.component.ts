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
  uploadStatus: "PENDING" | "DONE" | "FAILURE" | "OTHER" = "PENDING";
  canBeClosed = true;
  uploading = false;
  error: string | undefined;

  configTest: string = "";

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
    const files: { [key: string]: File } = this.file.nativeElement.files;
    for (let key in files) {
      if (!isNaN(parseInt(key))) {
        this.addedFile = files[key];
      }
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
            return true;
          } else {
            return false;
          }
        }),
      )
      .pipe(
        filter(resp => {
          if (resp.uploadStatus == "PENDING" || resp.uploadStatus == "DONE") {
            // TODO: update on UI 
            this.progress = resp.progress;
            this.uploadStatus = resp.uploadStatus;
          }
          return resp.uploadStatus == "DONE";
        }),
        take(1)
      )
      .subscribe(experimentUpload => {
        if (experimentUpload.importId) {
          // TODO: check if successful
          const importId: number = experimentUpload.importId;
          // File upload complete. Poll for result. 
          // TODO: show sth in UI
          interval(1000)
            .pipe(
              startWith(0),
              switchMap(() => this.backend.importExperimentPoll(importId)),
              filter(resp => resp.status != "PENDING"),
              take(1)
            )
            .subscribe(resp => {
              console.log(resp)
              if (resp.status == "DONE") {
                // close dialog
                // TODO: update UI, include experiment in experiments!
                this.dialogRef.close({ experimentId: resp.experimentId });
              } else if (resp.status == "FAILURE") {
                console.error("Something went wrong. Check errors at backend.")
                this.error = "Something went wrong. Check errors at backend.";
                this.uploading = false;
              }
            })
        } else {
          console.error("Something went wrong.")
        }
      })
  }
}
