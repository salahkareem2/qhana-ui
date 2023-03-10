import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
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
    private exportsCache: ExportCache[] | null = null;
    private exportList: BehaviorSubject<ExportResult[] | null> = new BehaviorSubject<ExportResult[] | null>(null);
    private downloadsCounter: BehaviorSubject<number> = new BehaviorSubject(0);

    constructor(private backend: QhanaBackendService) {
        timer(0, 2000).subscribe(() => {
            var resp = this.backend.getExportList().pipe(
                map(resp => {
                    this.updateExports(resp);
                    this.exportList.next(resp);
                    return resp;
                })
            )
            // hacky, but need pseudosubscription to start polling
            resp.subscribe(() => console.log());
        })
    }

    getExportList(): BehaviorSubject<ExportResult[] | null> {
        return this.exportList;
    }

    getDownloadsCounter(): BehaviorSubject<number> {
        return this.downloadsCounter;
    }

    updateExports(exports: ExportResult[]) {
        let tmpExportsCache: ExportCache[] = [];
        let changeCounter: number = 0;
        let index: number = 0;
        // check number of changes between (new) exports and (old) exportsCache
        // exports and exportsCache are ordered desc by exportId
        exports.forEach(exp => {
            tmpExportsCache.push({ exportId: exp.exportId, status: exp.status });
            if (this.exportsCache != null) {
                if (this.exportsCache.length > index
                    && exp.exportId == this.exportsCache[index].exportId) {
                    if (exp.status != this.exportsCache[index].status) {
                        changeCounter++;
                    }
                    index++;
                } else {
                    changeCounter++;
                }
            }
        })
        this.exportsCache = tmpExportsCache;
        this.downloadsCounter.next(this.downloadsCounter.value + changeCounter);
    }
}
