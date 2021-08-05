import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CurrentExperimentService } from 'src/app/services/current-experiment.service';
import { ExperimentApiObject } from 'src/app/services/qhana-backend.service';

@Component({
    selector: 'qhana-experiment',
    templateUrl: './experiment.component.html',
    styleUrls: ['./experiment.component.sass']
})
export class ExperimentComponent implements OnInit, OnDestroy {

    private routeSubscription: Subscription | null = null;

    private experimentSubscription: Subscription | null = null;

    experiment: ExperimentApiObject | null = null;

    constructor(private route: ActivatedRoute, private experimentService: CurrentExperimentService) { }

    ngOnInit(): void {
        this.routeSubscription = this.route.params.pipe(map(params => params.experimentId)).subscribe(experimentId => this.experimentService.setExperimentId(experimentId));
        this.experimentSubscription = this.experimentService.experiment.subscribe(experiment => this.experiment = experiment);
    }

    ngOnDestroy(): void {
        this.routeSubscription?.unsubscribe();
        this.experimentSubscription?.unsubscribe();
    }

}
