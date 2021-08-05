import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CurrentExperimentService } from 'src/app/services/current-experiment.service';

@Component({
    selector: 'qhana-experiment-nav',
    templateUrl: './experiment-nav.component.html',
    styleUrls: ['./experiment-nav.component.sass']
})
export class ExperimentNavComponent implements OnInit {
    @Input() active: string = "";

    experimentId: Observable<string | null> | null = null;

    constructor(private currentExperiment: CurrentExperimentService) { }

    ngOnInit(): void {
        this.experimentId = this.currentExperiment.experimentId;
    }

}
