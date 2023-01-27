import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { debounceTime, filter, first, map, startWith, switchMap, take, takeWhile } from 'rxjs/operators';
import { ExportExperimentDialog } from 'src/app/dialogs/export-experiment/export-experiment.component';
import { CurrentExperimentService } from 'src/app/services/current-experiment.service';
import { ExperimentExportPollObject } from 'src/app/services/qhana-backend.service';
import { ExperimentApiObject, QhanaBackendService } from 'src/app/services/qhana-backend.service';
import { saveAs } from 'file-saver';

@Component({
    selector: 'qhana-experiment',
    templateUrl: './experiment.component.html',
    styleUrls: ['./experiment.component.sass']
})
export class ExperimentComponent implements OnInit, OnDestroy {

    private routeSubscription: Subscription | null = null;

    private experimentSubscription: Subscription | null = null;

    private lastSavedTitle: string = "";
    private lastSavedDescription: string = "";
    private titleUpdates: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
    private descriptionUpdates: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
    private autoSaveTitleSubscription: Subscription | null = null;
    private autoSaveDescriptionSubscription: Subscription | null = null;

    updateStatus: "original" | "changed" | "saved" = "original";

    experimentId: string | null = null;
    experiment: ExperimentApiObject | null = null;

    experimentName: string | null = null;
    experimentDescription: string = ""; // only updated on initial experiment load
    currentExperimentDescription: string = "";

    constructor(private route: ActivatedRoute, private router: Router, private experimentService: CurrentExperimentService, private backend: QhanaBackendService, public dialog: MatDialog) { }

    ngOnInit(): void {
        this.routeSubscription = this.route.params.pipe(map(params => params.experimentId)).subscribe(experimentId => {
            this.experimentId = experimentId;
            this.experimentService.setExperimentId(experimentId);
        });
        this.experimentSubscription = this.experimentService.experiment.pipe(
            filter(experiment => experiment?.experimentId !== this.experiment?.experimentId)
        ).subscribe(experiment => {
            this.experiment = experiment;
            this.lastSavedDescription = experiment?.description ?? "";
            this.experimentDescription = experiment?.description ?? "";
            this.currentExperimentDescription = experiment?.description ?? "";
        });
        this.autoSaveTitleSubscription = this.titleUpdates.pipe(
            filter(value => value != null && value !== this.lastSavedTitle),
            debounceTime(500)
        ).subscribe(this.saveTitle);
        this.autoSaveDescriptionSubscription = this.descriptionUpdates.pipe(
            filter(value => value != null && value !== this.lastSavedDescription),
            debounceTime(500)
        ).subscribe(this.saveDescription);
    }

    ngOnDestroy(): void {
        this.routeSubscription?.unsubscribe();
        this.experimentSubscription?.unsubscribe();
        this.autoSaveTitleSubscription?.unsubscribe();
        this.autoSaveDescriptionSubscription?.unsubscribe();
    }

    cloneExperiment() {
        const experimentId = this.experimentId;
        if (experimentId == null) {
            return; // no experiment to clone...
        }
        this.backend.cloneExperiment(experimentId).subscribe(clonedExperiment => {
            this.router.navigate(['/experiments', clonedExperiment.experimentId, "info"]);
        });
    }

    editExperimentName() {
        this.experimentName = this.experiment?.name ?? null;
        this.lastSavedTitle = this.experiment?.name ?? "";
    }

    cancelEditExperimentName() {
        this.experimentName = null;
    }

    updateTitle(newTitle: string) {
        if (newTitle !== this.lastSavedTitle) {
            this.updateStatus = 'changed';
        }
        this.titleUpdates.next(newTitle);
    }

    updateDescription(newDescription: string) {
        if (this.updateStatus === "original") {
            if (newDescription == "" || newDescription === this.experiment?.description) {
                // do not update anything if it has not been changed by the user!
                return;
            }
        }
        this.currentExperimentDescription = newDescription;
        if (newDescription !== this.lastSavedDescription) {
            this.updateStatus = 'changed';
        }
        this.descriptionUpdates.next(newDescription);
    }

    saveTitle = (newTitle: string | null) => {
        if (newTitle == null) {
            return;
        }
        const description = this.currentExperimentDescription;
        if (newTitle === this.lastSavedTitle && description == this.lastSavedDescription) {
            return; // title is already saved!
        }
        if (this.experimentId == null || description == null) {
            return;
        }
        this.backend.updateExperiment(this.experimentId, newTitle, description).subscribe(result => {
            this.lastSavedTitle = newTitle;
            this.lastSavedDescription = description;
            this.experiment = result;
            this.updateStatus = 'saved';
            this.experimentService.reloadExperiment();
        });
    }

    saveDescription = (newDescription: string | null) => {
        if (newDescription == null) {
            return;
        }
        const title = this.experimentName ?? this.experiment?.name;
        if (title === this.lastSavedTitle && newDescription == this.lastSavedDescription) {
            return; // title is already saved!
        }
        if (this.experimentId == null || title == null) {
            return;
        }
        this.backend.updateExperiment(this.experimentId, title, newDescription).subscribe(result => {
            this.lastSavedTitle = title;
            this.lastSavedDescription = newDescription;
            this.experiment = result;
            this.updateStatus = 'saved';
            this.experimentService.reloadExperiment();
        });
    }

    showExportExperimentDialog(error?: string) {
        console.log("DIALOG")
        const dialogRef = this.dialog.open(ExportExperimentDialog, { minWidth: "20rem", maxWidth: "40rem", width: "60%", data: { error: error } });
        dialogRef.afterClosed().subscribe(result => {
            if (result == null) {
                return; // dialog was cancelled
            }

            // check input data
            if (result.test == null || result.test === "") {
                // TODO
                console.error("Incorrect export config!", result);
            }
            const experimentId = this.experimentId;
            if (experimentId == null) {
                return; // should never happen outside of race conditions
            }
            this.backend.exportExperiment(experimentId, result.test).subscribe(exportResource => {
                // poll until success
                interval(1000)
                    .pipe(
                        startWith(0),
                        switchMap(() => this.backend.exportExperimentPoll(experimentId, exportResource.exportId)),
                        filter(resp => resp.status != "PENDING"),
                        take(1)
                    )
                    .subscribe(resp => {
                        console.log(resp.status)
                        if (resp.status == "SUCCESS") {
                            console.log("success")
                            if (resp.fileLink != undefined) {
                                console.log("create download link")
                                window.open(resp.fileLink, "_blank");
                            } else {
                                // should not happen
                                console.log("Error in export experiment poll result handling.")
                            }
                        } else if (resp.status == "FAILURE") {
                            console.log("Something went wrong in polling the result for experiment export.");
                            this.showExportExperimentDialog("Something went wrong. Please try again later or look at the logs.");
                        }
                    })
            });
        });
    }

}
