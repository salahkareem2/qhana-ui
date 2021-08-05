import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CurrentExperimentService } from 'src/app/services/current-experiment.service';

@Component({
    selector: 'qhana-experiment-workspace',
    templateUrl: './experiment-workspace.component.html',
    styleUrls: ['./experiment-workspace.component.sass']
})
export class ExperimentWorkspaceComponent implements OnInit, OnDestroy {

    private routeSubscription: Subscription | null = null;

    constructor(private route: ActivatedRoute, private experiment: CurrentExperimentService) { }

    ngOnInit(): void {
        this.routeSubscription = this.route.params.subscribe(params => this.experiment.setExperimentId(params?.experimentId ?? null));
    }

    ngOnDestroy(): void {
        this.routeSubscription?.unsubscribe();
    }

}
