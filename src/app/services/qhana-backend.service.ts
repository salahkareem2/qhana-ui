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

    public getExperimentData(experimentId: number | string, dataName: string): Observable<ExperimentDataApiObject> {
        return this.http.get<any>(`${this.rootUrl}/experiments/${experimentId}/data/${dataName}`).pipe(map(data => {
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
}
