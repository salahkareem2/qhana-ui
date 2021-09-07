import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CurrentExperimentService } from 'src/app/services/current-experiment.service';
import { QhanaBackendService, TimelineStepApiObject } from 'src/app/services/qhana-backend.service';

@Component({
    selector: 'qhana-timeline-step',
    templateUrl: './timeline-step.component.html',
    styleUrls: ['./timeline-step.component.sass']
})
export class TimelineStepComponent implements OnInit {

    private routeSubscription: Subscription | null = null;

    backendUrl: string;

    experimentId: string = "";

    timelineStep: TimelineStepApiObject | null = null;

    constructor(private route: ActivatedRoute, private experiment: CurrentExperimentService, private backend: QhanaBackendService) {
        this.backendUrl = backend.backendRootUrl;
    }

    ngOnInit(): void {
        this.routeSubscription = this.route.params.subscribe(params => {
            this.experimentId = params.experimentId;
            this.experiment.setExperimentId(params.experimentId);
            this.loadData(params.experimentId, params.step);
        });
    }

    ngOnDestroy(): void {
        this.routeSubscription?.unsubscribe();
    }

    loadData(experimentId: number, step: string) {
        this.backend.getTimelineStep(experimentId, step).pipe(take(1)).subscribe(step => this.timelineStep = step);
    }

}
