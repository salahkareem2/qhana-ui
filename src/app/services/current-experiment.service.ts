import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ExperimentApiObject, QhanaBackendService } from './qhana-backend.service';

@Injectable({
    providedIn: 'root'
})
export class CurrentExperimentService {

    private routeSubscription: Subscription | null = null;

    private currentExperimentId: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
    private currentExperiment: BehaviorSubject<ExperimentApiObject | null> = new BehaviorSubject<ExperimentApiObject | null>(null);

    get experimentId() {
        return this.currentExperimentId.asObservable();
    }

    get experiment() {
        return this.currentExperiment.asObservable();
    }

    get experimentName() {
        return this.currentExperiment.asObservable().pipe(map(experiment => experiment?.name ?? null));
    }

    get experimentDescription() {
        return this.currentExperiment.asObservable().pipe(map(experiment => experiment?.description ?? null));
    }

    constructor(private backend: QhanaBackendService) { }

    private updateCurrentExperiment(experimentId: string | null) {
        if (experimentId == null) {
            this.setNewValues(null, null);
            return;
        }
        this.backend.getExperiment(experimentId).pipe(take(1)).subscribe(
            experiment => this.setNewValues(experimentId, experiment),
            err => this.setNewValues(experimentId, { "@self": "error", experimentId: parseInt(experimentId), name: "Error", description: err.toString() }),
        );
    }

    private setNewValues(experimentId: string | null, experiment: ExperimentApiObject | null) {
        if (this.currentExperimentId.getValue() !== experimentId) {
            this.currentExperimentId.next(experimentId);
        }
        if (this.currentExperiment.getValue() !== experiment) {
            this.currentExperiment.next(experiment);
        }
    }

    public setExperimentId(experimentId: string | null) {
        if (this.currentExperimentId.getValue() !== experimentId) {
            this.updateCurrentExperiment(experimentId);
        }
    }

    public reloadExperiment() {
        const experimentId = this.currentExperimentId.getValue();
        if (experimentId != null) {
            this.updateCurrentExperiment(experimentId);
        }
    }

}
