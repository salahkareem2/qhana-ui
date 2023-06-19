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
import { Component, Input, OnDestroy, OnInit, TrackByFunction } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ApiLink, CollectionApiObject } from 'src/app/services/api-data-types';
import { CurrentExperimentService } from 'src/app/services/current-experiment.service';
import { PluginRegistryBaseService } from 'src/app/services/registry.service';
import { TemplateApiObject, TemplatesService } from 'src/app/services/templates.service';
import { DownloadsService } from 'src/app/services/downloads.service';
import { ExportResult, QhanaBackendService } from 'src/app/services/qhana-backend.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'qhana-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.sass']
})
export class NavbarComponent implements OnInit, OnDestroy {

    @Input() title: string = "";

    currentExperiment: Observable<string | null>;
    experimentId: Observable<string | null>;
    downloadBadgeCounter: Observable<number> | null = null;

    exportList: Observable<ExportResult[] | null> | null = null;
    error: string | null = null;

    extraTabs: ApiLink[] = [];

    templateId: string | null = null;
    template: TemplateApiObject | null = null;

    private defaultTemplateSubscription: Subscription | null = null;
    private routeParamSubscription: Subscription | null = null;
    private changedTemplateTabSubscription: Subscription | null = null;
    private deletedTemplateTabSubscription: Subscription | null = null;

    constructor(private route: ActivatedRoute, private experiment: CurrentExperimentService, private templates: TemplatesService, private registry: PluginRegistryBaseService, private backend: QhanaBackendService, private downloadService: DownloadsService) {
        this.currentExperiment = this.experiment.experimentName;
        this.experimentId = this.experiment.experimentId;
    }

    ngOnInit(): void {
        this.routeParamSubscription = this.route.queryParamMap.subscribe(async params => {
            const templateId = params.get('template');
            if (templateId != null) {
                this.registry.getByRel<CollectionApiObject>(["ui-template", "collection"], new URLSearchParams([["template-id", templateId]])).then(response => {
                    if (response?.data?.items?.length == 1) {
                        this.registry.getByApiLink<TemplateApiObject>(response.data.items[0]).then(template => {
                            this.template = template?.data ?? null;
                            this.onTemplateChanges(template?.data ?? null);
                        });
                    } else {
                        this.onTemplateChanges(null);
                    }
                });
            }
            this.templateId = templateId;
        });
        this.registerSubscriptions();
        this.downloadBadgeCounter = this.downloadService.getDownloadsCounter();
        this.exportList = this.downloadService.getExportList();
    }

    private registerSubscriptions() {
        this.defaultTemplateSubscription = this.templates.defaultTemplate.subscribe(template => {
            this.onTemplateChanges(template);
        });
        this.changedTemplateTabSubscription = this.registry.changedApiObjectSubject.subscribe(async (apiObject) => {
            if (apiObject.changed.resourceKey?.uiTemplateId === this.templateId) {
                if (this.template != null) {
                    const response = await this.registry.getByApiLink<TemplateApiObject>(this.template?.self);
                    this.template = response?.data ?? null;
                }
                this.onTemplateChanges(this.template);
            }
        });
        this.deletedTemplateTabSubscription = this.registry.deletedApiObjectSubject.subscribe(async (apiObject) => {
            if (apiObject.deleted.resourceKey?.uiTemplateId === this.templateId && apiObject.deleted.resourceKey?.["?group"] === "experiment-navigation") {
                this.onTemplateChanges(this.template);
            }
        });
    }

    trackExport: TrackByFunction<ExportResult> = (index, item) => item.exportId.toString();

    deleteExport(experimentId: number, exportId: number) {
        this.backend.deleteExport(experimentId, exportId).subscribe(() => console.log());
    }

    exportListIsEmpty() {
        return this.downloadBadgeCounter?.subscribe();
    }

    ngOnDestroy(): void {
        this.defaultTemplateSubscription?.unsubscribe();
        this.routeParamSubscription?.unsubscribe();
        this.changedTemplateTabSubscription?.unsubscribe();
        this.deletedTemplateTabSubscription?.unsubscribe();
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
