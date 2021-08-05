import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CurrentExperimentService } from 'src/app/services/current-experiment.service';
import { ExperimentDataApiObject, QhanaBackendService } from 'src/app/services/qhana-backend.service';

@Component({
    selector: 'qhana-data-detail',
    templateUrl: './data-detail.component.html',
    styleUrls: ['./data-detail.component.sass']
})
export class DataDetailComponent implements OnInit, OnDestroy {

    private routeSubscription: Subscription | null = null;

    backendUrl: string = "http://localhost:9090"; // FIXME move this into settings somehow

    experimentId: string = "";

    data: ExperimentDataApiObject | null = null;

    constructor(private route: ActivatedRoute, private experiment: CurrentExperimentService, private backend: QhanaBackendService) { }

    ngOnInit(): void {
        this.routeSubscription = this.route.params.subscribe(params => {
            this.experimentId = params.experimentId;
            this.experiment.setExperimentId(params.experimentId);
            this.loadData(params.experimentId, params.dataName);
        });
    }

    ngOnDestroy(): void {
        this.routeSubscription?.unsubscribe();
    }

    loadData(experimentId: number, dataName: string) {
        this.backend.getExperimentData(experimentId, dataName).pipe(take(1)).subscribe(data => this.data = data);
    }

}
