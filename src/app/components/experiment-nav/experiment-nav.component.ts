import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'qhana-experiment-nav',
    templateUrl: './experiment-nav.component.html',
    styleUrls: ['./experiment-nav.component.sass']
})
export class ExperimentNavComponent implements OnInit {
    @Input() active: string = "";

    constructor() { }

    ngOnInit(): void {
    }

}
