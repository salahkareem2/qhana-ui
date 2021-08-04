import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ExperimentApiObject, QhanaBackendService } from 'src/app/services/qhana-backend.service';

@Component({
    selector: 'qhana-experiment',
    templateUrl: './experiment.component.html',
    styleUrls: ['./experiment.component.sass']
})
export class ExperimentComponent implements OnInit, OnDestroy {

    private routeSubscription: Subscription | null = null;

    experiment: ExperimentApiObject | null = null;

    constructor(private route: ActivatedRoute, private backend: QhanaBackendService) { }

    ngOnInit(): void {
        this.routeSubscription = this.route.params.pipe(map(params => params.experimentId)).subscribe(experimentId => this.loadExperimentData(experimentId));
    }

    ngOnDestroy(): void {
        this.routeSubscription?.unsubscribe();
    }

    loadExperimentData(experimentId: number) {
        this.backend.getExperiment(experimentId).pipe(take(1)).subscribe(experiment => this.experiment = experiment);
    }


}
