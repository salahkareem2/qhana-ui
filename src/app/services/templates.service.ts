/*
 * Copyright 2022 University of Stuttgart
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

import { Injectable } from '@angular/core';
import { DefaultTitleStrategy } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ApiLink, ApiObject, PageApiObject } from './api-data-types';
import { CurrentExperimentService } from './current-experiment.service';
import { ExperimentApiObject } from './qhana-backend.service';
import { PluginRegistryBaseService } from './registry.service';


export interface TemplateApiObject extends ApiObject {  // TODO check fields
    name: string;
    description: string;
    tags: string[];
    groups: ApiLink[];
}


export interface TemplateTabApiObject extends ApiObject {  // TODO check fields
    name: string;
    description: string;
    sortKey: number;
    pluginsFilter: string;
    plugins: ApiLink;
}


@Injectable({
    providedIn: 'root'
})
export class TemplatesService {

    private currentExperimentSubscription: Subscription | null = null;

    private defaultTemplateSubject: BehaviorSubject<TemplateApiObject | null> = new BehaviorSubject<TemplateApiObject | null>(null);

    get defaultTemplate() {
        return this.defaultTemplateSubject.asObservable();
    }

    constructor(private currentExperiment: CurrentExperimentService, private registry: PluginRegistryBaseService) {
        this.currentExperimentSubscription = currentExperiment.experiment.subscribe(experiment => {
            this.updateDefaultTemplateFromExperiment(experiment);
        });
    }

    private async updateDefaultTemplateFromExperiment(experiment: ExperimentApiObject | null) {
        const defaultTemplateId = experiment?.templateId ?? null;

        const currentDefaultTemplateId = this.defaultTemplateSubject.value?.self?.resourceKey?.uiTemplateId;
        if (defaultTemplateId === currentDefaultTemplateId) {
            return // same ids, nothing to do
        }

        if (defaultTemplateId == null) {
            this.defaultTemplateSubject.next(null);
            return;
        }

        // need to fetch template resource from plugin registry
        const query = new URLSearchParams();
        query.set("template-id", defaultTemplateId.toString());
        const templatePage = await this.registry.getByRel<PageApiObject>([["ui-template", "collection"]], query, true);
        if (templatePage?.data.collectionSize === 1) {
            // only expect one template since IDs are unique
            const templateResponse = await this.registry.getByApiLink<TemplateApiObject>(templatePage.data.items[0], null, false);
            this.defaultTemplateSubject.next(templateResponse?.data ?? null);
        } else {
            console.warn(`Template API returned an ambiguous response for template id ${defaultTemplateId}`, templatePage);
        }
    }

    async addTemplate(newTemplate: TemplateApiObject) {
        const createLink = await this.registry.searchResolveRels(["create", "ui-template"]);
        return this.registry.submitByApiLink<TemplateApiObject>(createLink, newTemplate);
    }

    async updateTemplate(templateLink: ApiLink, template: TemplateApiObject) {
        return this.registry.submitByApiLink<TemplateApiObject>(templateLink, template);
    }
}
