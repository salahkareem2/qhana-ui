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

    exportListIsEmpty(): boolean {
        return this.exportsCache == null || this.exportsCache.length == 0;
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
        let newCheck: boolean = true;
        // check number of changes between (new) exports and (old) exportsCache
        // exports and exportsCache are ordered desc by exportId
        let tmpIndex: number = 0;
        exports.forEach(exp => {
            tmpExportsCache.push({ exportId: exp.exportId, status: exp.status });

            if (this.exportsCache != null) {
                if (index < this.exportsCache.length) {
                    // check if incoming export is new
                    if (newCheck && exp.exportId > this.exportsCache[0].exportId) {
                        changeCounter++;
                    } else {
                        newCheck = false;
                        // check if status changes in old exports
                        if (exp.exportId == this.exportsCache[index].exportId) {
                            if (exp.status != this.exportsCache[index].status) {
                                changeCounter++;
                            }
                            index++;
                        } else {
                            // old export(s) deleted => find matching index
                            tmpIndex = index + 1
                            while (tmpIndex < this.exportsCache.length && exp.exportId != this.exportsCache[tmpIndex].exportId) {
                                tmpIndex++;
                            }
                            index = tmpIndex;
                        }
                    }
                } else {
                    // nothing to do (older exports than cached ones are loaded)
                }
            }
        })
        this.exportsCache = tmpExportsCache;
        this.downloadsCounter.next(this.downloadsCounter.value + changeCounter);
    }
}
