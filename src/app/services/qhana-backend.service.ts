import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

    public getExperiment(experimentId: number | string): Observable<ExperimentApiObject> {
        return this.http.get<ExperimentApiObject>(`${this.rootUrl}/experiments/${experimentId}`);
    }

    public getExperimentDataPage(experimentId: number | string, page: number = 0, itemCount: number = 10): Observable<ApiObjectList<ExperimentDataApiObject>> {
        return this.http.get<ApiObjectList<ExperimentDataApiObject>>(`${this.rootUrl}/experiments/${experimentId}/data`);
    }
}
