import { Component, Input, OnChanges } from '@angular/core';
import { TimelineSubStepApiObject } from 'src/app/services/qhana-backend.service';
import { FormSubmitData } from '../plugin-uiframe/plugin-uiframe.component';

@Component({
    selector: 'qhana-timeline-substeps',
    templateUrl: './timeline-substeps.component.html',
    styleUrls: ['./timeline-substeps.component.sass']
})
export class TimelineSubstepsComponent implements OnChanges {

    @Input() substeps: TimelineSubStepApiObject[] = [];
    @Input() parentFinished: boolean = false;

    constructor() { }

    ngOnChanges(): void {
    }


    trackByFunction(index: number, substep: TimelineSubStepApiObject): number {
        return substep.substepNr;
    }

    onPluginUiFormSubmit(formData: FormSubmitData) {
        // TODO save substep input data
    }
}
