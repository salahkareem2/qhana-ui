import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExportResult, QhanaBackendService } from './qhana-backend.service';

interface ExportCache {
    exportId: number;
    status: "SUCCESS" | "FAILURE" | "PENDING";
}

@Injectable({
    providedIn: 'root'
})
export class DownloadsService {
    private exportList: BehaviorSubject<ExportResult[] | null> = new BehaviorSubject<ExportResult[] | null>(null);
    private downloadsCounter: BehaviorSubject<number> = new BehaviorSubject(0);

    constructor(private backend: QhanaBackendService) {
        timer(0, 5000).subscribe(() => { // TODO: change nested subscribe to mergemap
            var resp = this.backend.getExportList().pipe(
                map(resp => {
                    this.downloadsCounter.next(resp.length) // TODO remove sideeffects
                    this.exportList.next(resp);
                    return resp;
                })
            )
            // hacky, but need pseudosubscription to start polling
            resp.subscribe(() => console.log()); // TODO: use empty function
        })
    }

    update() {
        // TODO: change this for backoff mechanism
        // TODO: call in export dialog
        this.backend.getExportList().pipe(
            map(resp => {
                this.downloadsCounter.next(resp.length)
                this.exportList.next(resp);
                return resp;
            })
        )
    }

    getExportList(): Observable<ExportResult[] | null> {
        return this.exportList.asObservable();
    }


    getDownloadsCounter(): Observable<number> {
        return this.downloadsCounter.asObservable();
    }
}
