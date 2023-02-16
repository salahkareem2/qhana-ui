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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ApiLink, CollectionApiObject } from 'src/app/services/api-data-types';
import { CurrentExperimentService } from 'src/app/services/current-experiment.service';
import { PluginRegistryBaseService } from 'src/app/services/registry.service';
import { TemplateApiObject, TemplatesService } from 'src/app/services/templates.service';

@Component({
    selector: 'qhana-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.sass']
})
export class NavbarComponent implements OnInit, OnDestroy {

    @Input() title: string = "";

    currentExperiment: Observable<string | null>;
    experimentId: Observable<string | null>;

    extraTabs: ApiLink[] = [];

    private defaultTemplateSubscription: Subscription | null = null;

    constructor(private experiment: CurrentExperimentService, private templates: TemplatesService, private registry: PluginRegistryBaseService) {
        this.currentExperiment = this.experiment.experimentName;
        this.experimentId = this.experiment.experimentId;
    }


    ngOnInit(): void {
        this.defaultTemplateSubscription = this.templates.defaultTemplate.subscribe(template => {
            this.onTemplateChanges(template);
        });
    }

    ngOnDestroy(): void {
        this.defaultTemplateSubscription?.unsubscribe();
    }

    private async onTemplateChanges(template: TemplateApiObject | null) {
        if (template == null) {
            this.extraTabs = [];
            return;
        }

        const extraTabs: ApiLink[] = [];
        this.extraTabs = extraTabs;

        const navGroup = template.groups.find(group => group.resourceKey?.["?group"] === "experiment-navigation");
        if (navGroup == null) {
            return;
        }
        const groupResponse = await this.registry.getByApiLink<CollectionApiObject>(navGroup);

        groupResponse?.data?.items?.forEach(tab => extraTabs.push(tab));
    }

}
