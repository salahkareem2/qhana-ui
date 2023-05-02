import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, from, interval, timer } from 'rxjs';
import { debounceTime, map, switchMap, take } from 'rxjs/operators';
import { ExportResult, QhanaBackendService } from './qhana-backend.service';

interface ExportCache {
    exportId: number;
    status: "SUCCESS" | "FAILURE" | "PENDING";
}

@Injectable({
    providedIn: 'root'
})
export class DownloadsService {
    private exportList: BehaviorSubject<ExportResult[]> = new BehaviorSubject<ExportResult[]>([]);

    private updateScheduler: Subject<void> = new Subject();

    private waitingForDownloads: Set<string | number> = new Set();

    private fastUpdateTimer: Subscription | null = null;

    constructor(private backend: QhanaBackendService) {
        this.updateScheduler.pipe(
            // debounce updates if they somehow come very close together
            debounceTime(500),
        ).subscribe(() => this.updateExportList());

        // add a slow timer causing updates (every 10 minutes)
        timer(500, 1000 * 60 * 10).subscribe(() => {
            this.updateScheduler.next();
        });

        // subscribe to new exports to update list immediately
        backend.getExportUpdates().subscribe(() => this.updateScheduler.next())
    }

    private updateExportList() {
        this.backend.getExportList().subscribe(resp => {
            this.exportList.next(resp);

            // check if there were any changes with pending downloads
            const pendingSet: Set<string | number> = new Set();
            const pendingArray: Array<string | number> = []; // array for convenience method
            resp.forEach((value) => {
                if (value.status == 'PENDING') {
                    pendingSet.add(value.exportId);
                    pendingArray.push(value.exportId);
                }
            });
            if (pendingSet.size != this.waitingForDownloads.size || !pendingArray.every(eId => this.waitingForDownloads.has(eId))) {
                // some changes in items detected
                this.waitingForDownloads = pendingSet;
                if (pendingSet.size > 0) {
                    this.resetFastTimer();
                }
            }

            // get back to slow updates if there are no pending exports left
            if (pendingSet.size === 0) {
                this.fastUpdateTimer?.unsubscribe();
            }
        });
    }

    private resetFastTimer() {
        this.fastUpdateTimer?.unsubscribe();
        this.fastUpdateTimer = from([1, 2, 5, 10, 20, 30, 60]).pipe(
            switchMap(period => {
                return interval(period).pipe(take(3));
            })
        ).subscribe(() => this.updateScheduler.next());
    }

    update() {
        // immediately schedule the net update
        this.updateScheduler.next();
    }

    getExportList(): Observable<ExportResult[] | null> {
        return this.exportList.asObservable();
    }


    getDownloadsCounter(): Observable<number> {
        return this.exportList.asObservable().pipe(map(list => list.length ?? 0));
    }
}
