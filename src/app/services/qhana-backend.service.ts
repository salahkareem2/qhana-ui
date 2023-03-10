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

import { HttpEventType, HttpRequest, HttpResponse, HttpParams } from '@angular/common/http';
import { HttpClient, } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { filter, map, startWith, switchMap, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

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

export interface ExperimentExportApiObject extends ApiObject {
    exportId: number;
}

export interface ExportStatus {
    exportId: number;
    experimentId: number;
    status: "SUCCESS" | "FAILURE" | "PENDING";
    name: string;
}

export interface ExportResult extends ExportStatus {
    fileLink: string | null;
}

export interface ExperimentExportApiObject extends ApiObject {
    exportId: number;
}

export interface ExperimentExportPollObject extends ExperimentExportApiObject {
    status: string;
    fileLink?: string;
}

export interface ExperimentImportApiObject extends ApiObject {
    progress: number,
    uploadStatus: "PENDING" | "DONE" | "FAILURE" | "OTHER",
    importId?: number;
}

export interface ExperimentImportPollObject extends ApiObject {
    importId: number,
    status: string;
    experimentId?: number;
    name?: string;
    description?: string;
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

@Injectable({
    providedIn: 'root'
})
export class QhanaBackendService {

    private rootUrl: string;

    private latexUrl: string;

    public get backendRootUrl() {
        return this.rootUrl;
    }

    public get latexRendererUrl() {
        return this.latexUrl;
    }

    constructor(private http: HttpClient) {
        this.rootUrl = this.getBackendUrlFromConfig().replace(/\/+$/, '');;
        this.latexUrl = this.getLatexUrlFromConfig();
    }

    private getBackendUrlFromConfig() {
        let protocol = environment.QHANA_BACKEND_PROTOCOL;
        let hostname = environment.QHANA_BACKEND_HOSTNAME;
        let port = environment.QHANA_BACKEND_PORT;
        let path = environment.QHANA_BACKEND_PATH;

        if (localStorage) {
            protocol = localStorage.getItem("QHAna_backend_protocol") ?? protocol;
            hostname = localStorage.getItem("QHAna_backend_hostname") ?? hostname;
            port = localStorage.getItem("QHAna_backend_port") ?? port;
            path = localStorage.getItem("QHAna_backend_path") ?? path;
        }

        return `${protocol}//${hostname}:${port}${path}`;
    }

    public changeBackendUrl(protocol?: string, hostname?: string, port?: string, path?: string) {
        if (protocol == null) {
            localStorage.removeItem("QHAna_backend_protocol");
        } else {
            localStorage.setItem("QHAna_backend_protocol", protocol);
        }
        if (hostname == null) {
            localStorage.removeItem("QHAna_backend_hostname");
        } else {
            localStorage.setItem("QHAna_backend_hostname", hostname);
        }
        if (port == null) {
            localStorage.removeItem("QHAna_backend_port");
        } else {
            localStorage.setItem("QHAna_backend_port", port);
        }
        if (path == null) {
            localStorage.removeItem("QHAna_backend_path");
        } else {
            localStorage.setItem("QHAna_backend_path", path);
        }

        // set new URL
        this.rootUrl = this.getBackendUrlFromConfig().replace(/\/+$/, '');;
    }

    private getLatexUrlFromConfig() {
        // http://localhost:5030/renderLatex
        let protocol = window?.location?.protocol ?? "http:";
        let hostname = window?.location?.hostname ?? "localhost";
        let port = "5030";
        let path = "/renderLatex";
        if (localStorage) {
            protocol = localStorage.getItem("QHAna_latex_protocol") ?? protocol;
            hostname = localStorage.getItem("QHAna_latex_hostname") ?? hostname;
            port = localStorage.getItem("QHAna_latex_port") ?? port;
            path = localStorage.getItem("QHAna_latex_path") ?? path;
        }
        return `${protocol}//${hostname}:${port}${path}`;
    }

    public changeLatexUrl(protocol?: string, hostname?: string, port?: string, path?: string) {
        if (protocol == null) {
            localStorage.removeItem("QHAna_latex_protocol");
        } else {
            localStorage.setItem("QHAna_latex_protocol", protocol);
        }
        if (hostname == null) {
            localStorage.removeItem("QHAna_latex_hostname");
        } else {
            localStorage.setItem("QHAna_latex_hostname", hostname);
        }
        if (port == null) {
            localStorage.removeItem("QHAna_latex_port");
        } else {
            localStorage.setItem("QHAna_latex_port", port);
        }
        if (path == null) {
            localStorage.removeItem("QHAna_latex_path");
        } else {
            localStorage.setItem("QHAna_latex_path", path);
        }

        // set new URL
        this.latexUrl = this.getLatexUrlFromConfig();
    }

    public resetBackendUrl() {
        this.changeBackendUrl(undefined, undefined, undefined, undefined);
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

    public removePluginEndpoint(endpoint: PluginEndpointApiObject): Observable<void> {
        return this.http.delete(`${this.rootUrl}/plugin-endpoints/${endpoint.endpointId}`).pipe(map(() => { return; }));
    }

    public getExperimentsPage(page: number = 0, itemCount: number = 10, search: string | undefined = undefined, sort: number = 1): Observable<ApiObjectList<ExperimentApiObject>> {
        let queryParams = new HttpParams();
        if (search) {
            queryParams = queryParams.append("search", search);
        }
        queryParams = queryParams.append("page", page).append("item-count", itemCount).append("sort", sort);
        return this.http.get<ApiObjectList<ExperimentApiObject>>(`${this.rootUrl}/experiments`, { params: queryParams });
    }

    public createExperiment(name: string, description: string): Observable<ExperimentApiObject> {
        return this.http.post<ExperimentApiObject>(`${this.rootUrl}/experiments`, { name, description });
    }

    public getExperiment(experimentId: number | string): Observable<ExperimentApiObject> {
        return this.http.get<ExperimentApiObject>(`${this.rootUrl}/experiments/${experimentId}`);
    }

    public updateExperiment(experimentId: number | string, name: string, description: string): Observable<ExperimentApiObject> {
        return this.http.put<ExperimentApiObject>(`${this.rootUrl}/experiments/${experimentId}`, { name, description });
    }

    public cloneExperiment(experimentId: number | string): Observable<ExperimentApiObject> {
        return this.http.post<ExperimentApiObject>(`${this.rootUrl}/experiments/${experimentId}/clone`, undefined, { responseType: "json" });
    }

    /**
     * Export experiment and poll for result (download link)
     *
     * @param experimentId experiment id
     * @param restriction "ALL" for complete experiment, "LOGS" for only steps/substeps, "DATA" for only data files, or "STEPS" for a specified list of steps
     * @param allDataVersions if >= 0 all versions, else only newest
     * @param stepList specified list of steps
     * @returns experiment export poll object with result file link if successful
     */
    public exportExperiment(experimentId: number | string, restriction: "ALL" | "LOGS" | "DATA" | "STEPS" = "ALL", allDataVersions: number = 1, stepList: number[] = []): Observable<ExperimentExportPollObject> {
        return this.http.post<ExperimentExportApiObject>(`${this.rootUrl}/experiments/${experimentId}/export`, { restriction, allDataVersions, stepList }).pipe(
            switchMap(exportResource => {
                // poll until SUCCESS or FAILURE
                return interval(1000).pipe(
                    startWith(0),
                    switchMap(() => this.exportExperimentPoll(experimentId, exportResource.exportId)),
                    filter(resp => resp.status != "PENDING"),
                    take(1)
                )
            })
        );
    }

    /**
     * Poll for result of experiment export
     *
     * @param experimentId experiment id
     * @param exportId id of export resource returned by backend in export step
     * @returns experiment export poll object with result file link if successful
     */
    public exportExperimentPoll(experimentId: number | string, exportId: number | string): Observable<ExperimentExportPollObject> {
        return this.http.get(`${this.rootUrl}/experiments/${experimentId}/export/${exportId}`, { observe: 'response', responseType: 'arraybuffer' }).pipe(map(resp => {
            if (resp.headers.get("Content-Type") == "application/json") {
                return JSON.parse(new TextDecoder().decode(resp.body as ArrayBuffer));
            } else if (resp.headers.get("Content-Type") == "application/zip") {
                let result: ExperimentExportPollObject = {
                    '@self': `${this.rootUrl}/experiments/${experimentId}/export/${exportId}`,
                    exportId: Number(exportId),
                    status: 'SUCCESS',
                    fileLink: `${this.rootUrl}/experiments/${experimentId}/export/${exportId}`
                };
                return result;
            } else {
                throw new Error("Experiment poll returned wrong file format: " + resp.headers.get("Content-Type"));
            }
        }));
    }

    public getExportList(itemCount: number = 10): Observable<ExportResult[]> {
        let queryParams = new HttpParams().append("item-count", itemCount);
        return this.http.get<ApiObjectList<ExportStatus>>(`${this.rootUrl}/experiments/export-list`, { params: queryParams }).pipe(map(resp => {
            const exportResultList: ExportResult[] = [];
            resp.items.forEach(exportStatus => {
                var fileLink: string | null;
                if (exportStatus.status == "SUCCESS") {
                    fileLink = `${this.rootUrl}/experiments/${exportStatus.experimentId}/export/${exportStatus.exportId}`
                } else {
                    fileLink = null;
                }
                exportResultList.push({
                    exportId: exportStatus.exportId,
                    experimentId: exportStatus.experimentId,
                    status: exportStatus.status,
                    name: exportStatus.name,
                    fileLink: fileLink
                })
            });
            return exportResultList;
        }));;
    }

    public importExperiment(experimentZip: File): Observable<ExperimentImportApiObject> {
        const formData: FormData = new FormData();
        formData.append("file", experimentZip, experimentZip.name);

        return this.http.post(`${this.rootUrl}/experiments/import`, formData, {
            observe: "events", responseType: "json", reportProgress: true
        }).pipe(
            map(event => {
                if (event.type == HttpEventType.UploadProgress) {
                    const progress = Math.round(100 * event.loaded / (event.total != undefined ? event.total : 100));
                    return {
                        "@self": `${this.rootUrl}/experiments/import`,
                        progress: progress,
                        uploadStatus: "PENDING"
                    }
                } else if (event instanceof HttpResponse) {
                    return {
                        "@self": `${this.rootUrl}/experiments/import`,
                        progress: 100,
                        uploadStatus: "DONE",
                        importId: JSON.parse(JSON.stringify(event.body)).importId
                    }
                } else {
                    return {
                        "@self": `${this.rootUrl}/experiments/import`,
                        progress: 0,
                        uploadStatus: "OTHER",
                    }
                }
            })
        );
    }

    public importExperimentPoll(importId: number): Observable<ExperimentImportPollObject> {
        return this.http.get<ExperimentImportPollObject>(`${this.rootUrl}/experiments/import/${importId}`, { responseType: "json" });
    }

    public getExperimentDataPage(experimentId: number | string, allVersions: boolean = true, search: string | null = null, page: number = 0, itemCount: number = 10, sort: number = 1): Observable<ApiObjectList<ExperimentDataApiObject>> {
        let queryParams = new HttpParams().append("all-versions", allVersions);
        if (search) {
            queryParams = queryParams.append("search", search);
        }
        queryParams = queryParams.append("page", page).append("item-count", itemCount).append("sort", sort);
        return this.http.get<ApiObjectList<ExperimentDataApiObject>>(`${this.rootUrl}/experiments/${experimentId}/data`, { params: queryParams });
    }

    public getExperimentData(experimentId: number | string, dataName: string, version: string = "latest"): Observable<ExperimentDataApiObject> {
        const versionQuery = `?version=${version != null ? version : 'latest'}`
        return this.http.get<any>(`${this.rootUrl}/experiments/${experimentId}/data/${dataName}${versionQuery}`).pipe(map(data => {
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
        }));
    }

    public getExperimentDataContent(downloadLink: string): Observable<Blob> {
        return this.http.get(downloadLink, { responseType: "blob" })
    }

    public getTimelineStepsPage(experimentId: number | string, page: number = 0, itemCount: number = 10, sort: number = 1, pluginName: string = "", version: string = "", stepStatus: "SUCCESS" | "PENDING" | "ERROR" | "" = "", unclearedSubstep: number = 0): Observable<ApiObjectList<TimelineStepApiObject>> {
        const queryParams = new HttpParams()
            .append("plugin-name", pluginName)
            .append("version", version)
            .append("status", stepStatus)
            .append("uncleared-substep", unclearedSubstep)
            .append("page", page)
            .append("item-count", itemCount)
            .append("sort", sort);
        return this.http.get<ApiObjectList<TimelineStepApiObject>>(`${this.rootUrl}/experiments/${experimentId}/timeline`, { params: queryParams });
    }

    public createTimelineStep(experimentId: number | string, stepData: TimelineStepPostData): Observable<TimelineStepApiObject> {
        return this.http.post<TimelineStepApiObject>(`${this.rootUrl}/experiments/${experimentId}/timeline`, stepData);
    }

    public getTimelineStep(experimentId: number | string, step: number | string): Observable<TimelineStepApiObject> {
        return this.http.get<TimelineStepApiObject>(`${this.rootUrl}/experiments/${experimentId}/timeline/${step}`);
    }

    public getTimelineStepNotes(experimentId: number | string, step: number | string): Observable<TimelineStepNotesApiObject> {
        return this.http.get<TimelineStepNotesApiObject>(`${this.rootUrl}/experiments/${experimentId}/timeline/${step}/notes`);
    }

    public saveTimelineStepResultQuality(experimentId: number | string, step: number | string, newQuality: "UNKNOWN" | "NEUTRAL" | "GOOD" | "BAD" | "ERROR" | "UNUSABLE"): Observable<null> {
        return this.http.put<null>(`${this.rootUrl}/experiments/${experimentId}/timeline/${step}`, { resultQuality: newQuality });
    }

    public saveTimelineStepNotes(experimentId: number | string, step: number | string, notes: string): Observable<TimelineStepNotesApiObject> {
        return this.http.put<TimelineStepNotesApiObject>(`${this.rootUrl}/experiments/${experimentId}/timeline/${step}/notes`, { notes: notes });
    }

    public saveSubStepInputData(experimentId: number | string, step: number | string, substep: number | string, data: TimelineSubStepPostData): Observable<TimelineSubStepApiObject> {
        return this.http.post<TimelineSubStepApiObject>(`${this.rootUrl}/experiments/${experimentId}/timeline/${step}/substeps/${substep}`, data);
    }

    public getTimelineSubStep(experimentId: number | string, step: number | string, substep: number | string): Observable<TimelineSubStepApiObject> {
        return this.http.get<TimelineSubStepApiObject>(`${this.rootUrl}/experiments/${experimentId}/timeline/${step}/substeps/${substep}`);
    }
}
