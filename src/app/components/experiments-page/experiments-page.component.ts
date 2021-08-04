import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ExperimentApiObject, QhanaBackendService } from 'src/app/services/qhana-backend.service';

@Component({
    selector: 'qhana-experiments-page',
    templateUrl: './experiments-page.component.html',
    styleUrls: ['./experiments-page.component.sass']
})
export class ExperimentsPageComponent implements OnInit {

    collectionSize: number = 0;

    loading: boolean = true;
    currentPage: { page: number, itemCount: number } | null = null;

    error: string | null = null;

    experiments: Observable<ExperimentApiObject[]> | null = null;

    constructor(private backend: QhanaBackendService) { }

    ngOnInit(): void {
        this.updatePageContent()
    }

    onPageChange(pageEvent: PageEvent) {
        console.log(pageEvent.pageIndex, pageEvent.pageSize);

    }

    updatePageContent(page: number = 1, itemCount: number = 10) {
        this.loading = true;
        this.error = null;
        const currentRequest = { page: page, itemCount: itemCount };
        this.currentPage = currentRequest;
        this.experiments = this.backend.getExperimentsPage(page, itemCount).pipe(
            map(value => {
                if (this.currentPage !== currentRequest) {
                    throw Error("Cancelled by other request.");
                }
                this.collectionSize = value.itemCount;
                this.loading = false;
                return value.items;
            }),
            catchError(err => {
                if (this.currentPage !== currentRequest) {
                    // ignore errors of past requests
                    return of([]);
                }
                this.error = err.toString();
                this.loading = false;
                throw err;
            })
        );
    }

    reloadPage() {
        if (this.currentPage == null) {
            this.updatePageContent();
        } else {
            const { page, itemCount } = this.currentPage;
            this.updatePageContent(page, itemCount);
        }
    }

}
