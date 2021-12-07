import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface FormSubmitData {
    type: "form-submit";
    formData: string;
    formDataType: string;
    dataInputs: string[];
    submitUrl: string;
    resultUrl: string;
    microfrontendUrl?: string;
}

function isFormSubmitData(data: any): data is FormSubmitData {
    if (data == null) {
        return false;
    }
    if (data.type !== "form-submit") {
        return false;
    }
    if (data.formData == null || data.formDataType == null || data.dataInputs == null || data.submitUrl == null || data.resultUrl == null) {
        return false;
    }
    if (typeof data.formData !== "string" || typeof data.formDataType !== "string" || typeof data.submitUrl !== "string" || typeof data.resultUrl !== "string") {
        return false;
    }
    if (!Array.isArray(data.dataInputs)) {
        return false;
    }
    return true;
}


@Component({
    selector: 'qhana-plugin-uiframe',
    templateUrl: './plugin-uiframe.component.html',
    styleUrls: ['./plugin-uiframe.component.sass']
})
export class PluginUiframeComponent implements OnInit, OnChanges, OnDestroy {

    @ViewChild('uiframe', { static: true }) uiframe: ElementRef | null = null;

    @Input() url: string | null = null;
    @Output() formDataSubmit: EventEmitter<FormSubmitData> = new EventEmitter();

    pluginOrigin: string | null = null;
    frontendUrl: SafeResourceUrl | null = null;
    frontendHeight: number = 100;

    listenerAbortController = new AbortController();

    constructor(private sanitizer: DomSanitizer) { }

    ngOnInit(): void {
        (window as any).addEventListener("message", (event: MessageEvent) => { this.handleMicroFrontendEvent(event); }, { signal: this.listenerAbortController.signal });
    }

    ngOnDestroy(): void {
        this.listenerAbortController.abort();
    }

    ngOnChanges(changes: SimpleChanges): void {
        const url: string | null = this.url;
        if (url == null) {
            this.pluginOrigin = null;
            this.frontendUrl = null;
            this.frontendHeight = 100;
            return;
        }
        this.pluginOrigin = (new URL(url)).origin;
        this.frontendHeight = 100;
        this.frontendUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    private sendMessage(message: any) {
        this.uiframe?.nativeElement.contentWindow.postMessage(message, this.pluginOrigin);
    }

    private handleMicroFrontendEvent(event: MessageEvent) {
        if (this.pluginOrigin == null || event.origin !== this.pluginOrigin) {
            return; // unsafe event
        }
        const data = event.data;
        if (typeof data === "string") {
            // handle string messages
            console.log("Message:", data);
            if (data === "ui-loaded") {
                const styles = document.querySelectorAll<HTMLLinkElement>('head link[rel="stylesheet"]');
                const styleUrls: string[] = [];
                styles.forEach((styleElement) => {
                    styleUrls.push(styleElement.href.toString());
                })
                console.log(styles);
                this.sendMessage({ type: "load-css", "urls": styleUrls });
            }
        } else { // assume object message
            if (data?.type === "ui-resize") {
                this.frontendHeight = Math.max(data.height ?? 100, 20);
            }
            if (data?.type === "form-submit") {
                if (!isFormSubmitData(data)) {
                    return;
                }
                this.formDataSubmit.emit(data);
            }
        }
        console.log(event.data) // TODO  remove later
    }
}
