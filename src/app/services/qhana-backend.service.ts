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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, mergeMap, take } from 'rxjs/operators';
import { ServiceRegistryService } from './service-registry.service';

export interface ApiObject {
    "@self": string;
}

export interface ApiObjectList<T> extends ApiObject {
    itemCount: number;
    items: T[];
}

export interface PluginEndpointApiObject extends ApiObject {
    endpointId: number;
    url: string;
    type: "PluginRunner" | "Plugin" | string;
}

export interface ExperimentApiObject extends ApiObject {
    experimentId: number;
    name: string;
    description: string;
}

export interface ExperimentDataApiObject extends ApiObject {
    download: string;
    name: string;
    version: string;
    type: string;
    contentType: string;
    producedBy?: number;
    usedBy?: number[];
}

export interface ExperimentDataRef {
    name: string;
    version: string;
}

export interface TimelineStepQueryFilter {
    itemCount?: number;
    pluginName?: string;
    version?: string;
    sort?: 1 | -1 | 0;
}

export interface TimelineStepPostData {
    resultLocation: string;
    inputData: string[];

    processorName: string;
    processorVersion: string;
    processorLocation: string;
    parameters: string;
    parametersContentType: string;
};

export interface TimelineSubStepPostData {
    inputData: string[];
    parameters: string;
    parametersContentType: string;
};


export interface TimelineSubStepApiObject {
    substepNr: number;
    stepId: number;
    inputData?: ExperimentDataRef[];
    substepId?: string;
    href: string;
    hrefUi?: string;
    cleared: boolean;
    parameters?: string;
    parametersContentType?: string;

}

export interface TimelineStepApiObject extends ApiObject {
    sequence: number;
    start: string;
    end: string;
    status: string;
    resultQuality: "UNKNOWN" | "NEUTRAL" | "GOOD" | "BAD" | "ERROR" | "UNUSABLE";
    resultLog?: string;
    notes: string;
    processorName: string;
    processorVersion: string;
    processorLocation: string;
    parameters: string;
    parametersContentType: string;
    inputData?: ExperimentDataRef[];
    outputData?: ExperimentDataRef[];
    progressStart?: number;
    progressTarget?: number;
    progressValue?: number;
    progressUnit?: string;
    substeps?: TimelineSubStepApiObject[],
}

export interface TimelineStepNotesApiObject extends ApiObject {
    notes: string;
}

export interface TimelineStepResultQuality {
    resultQuality: string;
}

function urlIsString(url: string | null): url is string {
    return url != null;
}

@Injectable({
    providedIn: 'root'
})
export class QhanaBackendService {

    private rootUrl: string | null = null;

    private latexUrl: string | null = null;

    public get backendRootUrl() {
        return this.rootUrl;
    }

    public get latexRendererUrl() {
        return this.latexUrl;
    }

    constructor(private http: HttpClient, private serviceRegistry: ServiceRegistryService) {
        this.serviceRegistry.backendRootUrl.subscribe(url => this.rootUrl = url);
        this.serviceRegistry.latexRendererUrl.subscribe(url => this.latexUrl = url);
    }

    public getPluginEndpoints(): Observable<ApiObjectList<PluginEndpointApiObject>> {
        return this.http.get<ApiObjectList<PluginEndpointApiObject>>(`${this.rootUrl}/plugin-endpoints`);
    }

    public addPluginEndpoint(url: string, type?: string): Observable<PluginEndpointApiObject> {
        const body: { url: string, type?: string } = { url };
        if (type != null) {
            body.type = type;
        }
        return this.http.post<PluginEndpointApiObject>(`${this.rootUrl}/plugin-endpoints`, body);
    }

    private callWithRootUrl<T>(callback: (url: string) => Observable<T>): Observable<T> {
        return this.serviceRegistry.backendRootUrl.pipe(
            filter(urlIsString),
            take(1),
            mergeMap(callback)
        );
    }

    public removePluginEndpoint(endpoint: PluginEndpointApiObject): Observable<void> {
        return this.callWithRootUrl<void>(
            rootUrl => this.http.delete(`${rootUrl}/plugin-endpoints/${endpoint.endpointId}`).pipe(map(() => { return; }))
        );
    }

    public getExperimentsPage(page: number = 0, itemCount: number = 10): Observable<ApiObjectList<ExperimentApiObject>> {
        return this.callWithRootUrl<ApiObjectList<ExperimentApiObject>>(
            rootUrl => this.http.get<ApiObjectList<ExperimentApiObject>>(`${rootUrl}/experiments`)
        );
    }

    public createExperiment(name: string, description: string): Observable<ExperimentApiObject> {
        return this.callWithRootUrl<ExperimentApiObject>(
            rootUrl => this.http.post<ExperimentApiObject>(`${rootUrl}/experiments`, { name, description })
        );
    }

    public getExperiment(experimentId: number | string): Observable<ExperimentApiObject> {
        return this.callWithRootUrl<ExperimentApiObject>(
            rootUrl => this.http.get<ExperimentApiObject>(`${rootUrl}/experiments/${experimentId}`)
        );
    }

    public updateExperiment(experimentId: number | string, name: string, description: string): Observable<ExperimentApiObject> {
        return this.callWithRootUrl<ExperimentApiObject>(
            rootUrl => this.http.put<ExperimentApiObject>(`${rootUrl}/experiments/${experimentId}`, { name, description })
        );
    }

    public cloneExperiment(experimentId: number | string): Observable<ExperimentApiObject> {
        return this.callWithRootUrl<ExperimentApiObject>(
            rootUrl => this.http.post<ExperimentApiObject>(`${rootUrl}/experiments/${experimentId}/clone`, undefined, { responseType: "json" })
        );
    }

    public getExperimentDataPage(experimentId: number | string, page: number = 0, itemCount: number = 10): Observable<ApiObjectList<ExperimentDataApiObject>> {
        return this.callWithRootUrl<ApiObjectList<ExperimentDataApiObject>>(
            rootUrl => this.http.get<ApiObjectList<ExperimentDataApiObject>>(`${rootUrl}/experiments/${experimentId}/data?page=${page}&item-count=${itemCount}`)
        );
    }

    public getExperimentData(experimentId: number | string, dataName: string, version: string = "latest"): Observable<ExperimentDataApiObject> {
        const versionQuery = `?version=${version != null ? version : 'latest'}`
        return this.callWithRootUrl<ExperimentDataApiObject>(
            rootUrl => this.http.get<any>(`${rootUrl}/experiments/${experimentId}/data/${dataName}${versionQuery}`).pipe(map(data => {
                const dataObject: ExperimentDataApiObject = {
                    "@self": data["@self"],
                    download: data.download,
                    name: data.name,
                    version: data.version,
                    type: data.type,
                    contentType: data.contentType,
                }
                if (data.producingStep != null) {
                    dataObject.producedBy = data.producingStep;
                }
                if (data.inputFor != null) {
                    dataObject.usedBy = data.inputFor;
                }
                return dataObject;
            }))
        );
    }

    public getExperimentDataContent(downloadLink: string): Observable<Blob> {
        return this.callWithRootUrl<Blob>(
            rootUrl => this.http.get(downloadLink, { responseType: "blob" })
        );
    }

    public getTimelineStepsPage(experimentId: number | string, page: number = 0, query: TimelineStepQueryFilter = {}): Observable<ApiObjectList<TimelineStepApiObject>> {
        const search = new URLSearchParams([["page", page.toString()], ["item-count", query.itemCount?.toString() ?? "10"]]);
        if (query.pluginName != null) {
            search.set("plugin-name", query.pluginName);
        }
        if (query.version != null) {
            search.set("version", query.version);
        }
        if (query.sort != null) {
            search.set("sort", query.sort.toString());
        }
        return this.callWithRootUrl<ApiObjectList<TimelineStepApiObject>>(
            rootUrl => this.http.get<ApiObjectList<TimelineStepApiObject>>(
                `${rootUrl}/experiments/${experimentId}/timeline?${search.toString()}`
            )
        );
    }

    public createTimelineStep(experimentId: number | string, stepData: TimelineStepPostData): Observable<TimelineStepApiObject> {
        return this.callWithRootUrl<TimelineStepApiObject>(
            rootUrl => this.http.post<TimelineStepApiObject>(`${rootUrl}/experiments/${experimentId}/timeline`, stepData)
        );
    }

    public getTimelineStep(experimentId: number | string, step: number | string): Observable<TimelineStepApiObject> {
        return this.callWithRootUrl<TimelineStepApiObject>(
            rootUrl => this.http.get<TimelineStepApiObject>(`${rootUrl}/experiments/${experimentId}/timeline/${step}`)
        );
    }

    public getTimelineStepNotes(experimentId: number | string, step: number | string): Observable<TimelineStepNotesApiObject> {
        return this.callWithRootUrl<TimelineStepNotesApiObject>(
            rootUrl => this.http.get<TimelineStepNotesApiObject>(`${rootUrl}/experiments/${experimentId}/timeline/${step}/notes`)
        );
    }

    public saveTimelineStepResultQuality(experimentId: number | string, step: number | string, newQuality: "UNKNOWN" | "NEUTRAL" | "GOOD" | "BAD" | "ERROR" | "UNUSABLE"): Observable<null> {
        return this.callWithRootUrl<null>(
            rootUrl => this.http.put<null>(`${rootUrl}/experiments/${experimentId}/timeline/${step}`, { resultQuality: newQuality })
        );
    }

    public saveTimelineStepNotes(experimentId: number | string, step: number | string, notes: string): Observable<TimelineStepNotesApiObject> {
        return this.callWithRootUrl<TimelineStepNotesApiObject>(
            rootUrl => this.http.put<TimelineStepNotesApiObject>(`${rootUrl}/experiments/${experimentId}/timeline/${step}/notes`, { notes: notes })
        );
    }

    public saveSubStepInputData(experimentId: number | string, step: number | string, substep: number | string, data: TimelineSubStepPostData): Observable<TimelineSubStepApiObject> {
        return this.callWithRootUrl<TimelineSubStepApiObject>(
            rootUrl => this.http.post<TimelineSubStepApiObject>(`${rootUrl}/experiments/${experimentId}/timeline/${step}/substeps/${substep}`, data)
        );
    }

    public getTimelineSubStep(experimentId: number | string, step: number | string, substep: number | string): Observable<TimelineSubStepApiObject> {
        return this.callWithRootUrl<TimelineSubStepApiObject>(
            rootUrl => this.http.get<TimelineSubStepApiObject>(`${this.rootUrl}/experiments/${experimentId}/timeline/${step}/substeps/${substep}`)
        );
    }
}
