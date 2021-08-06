import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PluginsService, QhanaPlugin } from 'src/app/services/plugins.service';

@Component({
    selector: 'qhana-plugin-ui',
    templateUrl: './plugin-ui.component.html',
    styleUrls: ['./plugin-ui.component.sass']
})
export class PluginUiComponent implements OnInit, OnDestroy, OnChanges {

    @Input() plugin: QhanaPlugin | null = null;

    @ViewChild('frontend', { static: true }) frontendNode: ElementRef | null = null;
    private observer: MutationObserver = new MutationObserver((mutations, observer) => { this.observeMutation(mutations, observer) });

    microFrontend: SafeHtml | null = null;

    constructor(private plugins: PluginsService, private sanitizer: DomSanitizer) { }

    ngOnInit(): void {
        this.instrumentFrontendElement();
    }

    ngOnDestroy(): void {
        this.observer.disconnect();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.plugin != null) {
            this.plugins.getPluginUi(this.plugin).pipe(
                map(frontend => {
                    //return this.sanitizer.sanitize(SecurityContext.HTML, frontend);
                    return this.sanitizer.bypassSecurityTrustHtml(frontend);
                }),
            ).subscribe(frontend => this.microFrontend = frontend);
        }
    }

    private instrumentFrontendElement() {
        const node = this.frontendNode?.nativeElement;
        this.observer.observe(node, {
            childList: true,
        });
    }

    private observeMutation(mutations: MutationRecord[], observer: MutationObserver) {
        const node = mutations[0].target as HTMLDivElement;
        console.log(node)
        const forms = node.querySelectorAll("form.qhana-form") as NodeListOf<HTMLFormElement>;
        forms.forEach(form => {
            form.onsubmit = ev => this.onMicrofrontendSubmit(ev);
        })
    }

    private onMicrofrontendSubmit(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        //console.log(event);
        const form = event.target as HTMLFormElement;
        const submitter = (event as any).submitter as HTMLFormElement | HTMLInputElement | HTMLButtonElement | undefined;
        //console.log(form, submitter)
        const formData = new FormData(form);
        let formMethod = form.method;
        let formAction = new URL(form.action);
        if (submitter != null) {
            formAction = new URL(submitter.formAction);
            formMethod = submitter.formMethod ?? formMethod;
        }
        if (formAction.pathname.startsWith("/experiments/") || formAction.pathname.endsWith("/ui/") || formAction.pathname.endsWith("/ui")) {
            this.updateMicroFrontend(formData, formMethod);
        } else {
            // TODO submit result to backend!
        }
    }

    private updateMicroFrontend(formData: FormData, method: string | null) {
        const plugin = this.plugin;
        if (plugin == null) {
            return;
        }
        console.log(method);
        let observable: Observable<string>;
        if (method == null || method === "" || method === "get" || method === "GET") {
            observable = this.plugins.getPluginUiWithData(plugin, formData);
        } else {
            if (method !== "post" && method !== "POST") {
                return; // unsupported update method
            }
            observable = this.plugins.postPluginUiWithData(plugin, formData);
        }
        observable.pipe(
            map(frontend => {
                //return this.sanitizer.sanitize(SecurityContext.HTML, frontend);
                return this.sanitizer.bypassSecurityTrustHtml(frontend);
            }),
        ).subscribe(frontend => this.microFrontend = frontend);
    }

}
