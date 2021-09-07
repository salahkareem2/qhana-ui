import { Component, Input, OnChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ExperimentDataApiObject, QhanaBackendService } from 'src/app/services/qhana-backend.service';

const SPECIAL_MIMETYPES = new Set(["text/html"]);

@Component({
    selector: 'qhana-data-preview',
    templateUrl: './data-preview.component.html',
    styleUrls: ['./data-preview.component.sass']
})
export class DataPreviewComponent implements OnChanges {

    @Input() data: ExperimentDataApiObject | null = null;

    dataUrl: SafeResourceUrl | null = null;
    effectiveMimetype: string | null = null;

    constructor(private backend: QhanaBackendService, private sanitizer: DomSanitizer) { }

    ngOnChanges(): void {
        let mimetype = this.data?.contentType ?? null;
        if (mimetype) {
            if (!SPECIAL_MIMETYPES.has(mimetype)) {
                if (mimetype.startsWith("text/")) {
                    mimetype = "text/*";
                }
                if (mimetype.startsWith("image/")) {
                    mimetype = "image/*";
                }
            }
        }
        const downloadUrl = this.data?.download;
        if (downloadUrl) {
            this.effectiveMimetype = mimetype;
            this.dataUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.backend.backendRootUrl + downloadUrl);
        } else {
            this.effectiveMimetype = null;
            this.dataUrl = null;
        }
    }

}
