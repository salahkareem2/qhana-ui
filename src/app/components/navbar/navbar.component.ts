/*
 * Copyright 2021 University of Stuttgart
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CurrentExperimentService } from 'src/app/services/current-experiment.service';
import { QhanaBackendService } from 'src/app/services/qhana-backend.service';

@Component({
    selector: 'qhana-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.sass']
})
export class NavbarComponent {

    @Input() title: string = "";

    currentExperiment: Observable<string | null>;
    experimentId: Observable<string | null>;
    badgeCounter: number = 0;

    constructor(private experiment: CurrentExperimentService, private backend: QhanaBackendService) {
        this.currentExperiment = this.experiment.experimentName;
        this.experimentId = this.experiment.experimentId;
    }

    // TODO: this.backend.getExportList() to fetch list of exports and fill dropdown


}
