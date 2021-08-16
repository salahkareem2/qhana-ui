import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiObject {
    "@self": string;
}

export interface ApiObjectList<T> extends ApiObject {
    itemCount: number;
    items: T[];
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

export interface TimelineStepApiObject extends ApiObject {
    sequence: number;
    start: string;
    end: string;
    status: string;
    resultLog?: string;
    notes: string;
    processorName: string;
    processorVersion: string;
    processorLocation: string;
    parameters: string;
    parametersContentType: string;
    parametersDescriptionLocation: string;
    inputData?: ExperimentDataRef[];
    outputData?: ExperimentDataRef[];
}

@Injectable({
    providedIn: 'root'
})
export class QhanaBackendService {

    private rootUrl = "http://localhost:9090"

    constructor(private http: HttpClient) { }

    public getExperimentsPage(page: number = 0, itemCount: number = 10): Observable<ApiObjectList<ExperimentApiObject>> {
        return this.http.get<ApiObjectList<ExperimentApiObject>>(`${this.rootUrl}/experiments`);
    }

    public createExperiment(name: string, description: string): Observable<ExperimentApiObject> {
        return this.http.post<ExperimentApiObject>(`${this.rootUrl}/experiments`, { name, description });
    }

    public getExperiment(experimentId: number | string): Observable<ExperimentApiObject> {
        return this.http.get<ExperimentApiObject>(`${this.rootUrl}/experiments/${experimentId}`);
    }

    public getExperimentDataPage(experimentId: number | string, page: number = 0, itemCount: number = 10): Observable<ApiObjectList<ExperimentDataApiObject>> {
        return this.http.get<ApiObjectList<ExperimentDataApiObject>>(`${this.rootUrl}/experiments/${experimentId}/data`);
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

    public getTimelineStepsPage(experimentId: number | string, page: number = 0, itemCount: number = 10): Observable<ApiObjectList<TimelineStepApiObject>> {
        return this.http.get<ApiObjectList<TimelineStepApiObject>>(`${this.rootUrl}/experiments/${experimentId}/timeline`);
    }

    public getPluginRunners(): Observable<ApiObjectList<string>> {
        return this.http.get<ApiObjectList<string>>(`${this.rootUrl}/plugin-runners`);
    }

    public getTimelineStep(experimentId: number | string, step: number | string): Observable<TimelineStepApiObject> {
        return this.http.get<TimelineStepApiObject>(`${this.rootUrl}/experiments/${experimentId}/timeline/${step}`);
    }
}
