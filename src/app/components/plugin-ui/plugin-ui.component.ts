import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { CurrentExperimentService } from 'src/app/services/current-experiment.service';
import { PluginsService, QhanaPlugin } from 'src/app/services/plugins.service';
import { QhanaBackendService, TimelineStepPostData } from 'src/app/services/qhana-backend.service';

@Component({
    selector: 'qhana-plugin-ui',
    templateUrl: './plugin-ui.component.html',
    styleUrls: ['./plugin-ui.component.sass']
})
export class PluginUiComponent implements OnInit, OnDestroy, OnChanges {

    @Input() plugin: QhanaPlugin | null = null;

    @ViewChild('frontend', { static: true }) frontendNode: ElementRef | null = null;

    private observer: MutationObserver = new MutationObserver((mutations, observer) => { this.observeMutation(mutations, observer) });

    private experimentId: string | null = null;

    microFrontend: SafeHtml | null = null;

    constructor(private plugins: PluginsService, private backend: QhanaBackendService, private experiment: CurrentExperimentService, private router: Router, private sanitizer: DomSanitizer) { }

    ngOnInit(): void {
        this.experiment.experimentId.subscribe(experimentId => this.experimentId = experimentId);
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

    private instrumentDataInputElement(inputElement: HTMLInputElement) {
        let datalistId: string | null = inputElement.getAttribute('list');
        let datalist = inputElement.list;
        if (datalistId == null) {
            datalistId = 'list-' + Math.random().toString(16);
            datalist = document.createElement('datalist');
            datalist.setAttribute('id', datalistId);
            inputElement.after(datalist);
            inputElement.setAttribute('list', datalistId);
        }
        const dataType = inputElement.getAttribute('data-input');
        const contentTypes = inputElement.getAttribute('data-content-type')?.split(' ') ?? [];
        const experimentId = this.experimentId;
        if (experimentId == null) {
            console.warn("Tried instrumenting data input field before experiment id was known.");
            return;
        }
        const rootUrl = this.backend.backendRootUrl;
        this.backend.getExperimentDataPage(experimentId).subscribe(dataPage => {
            const optionNodes: HTMLOptionElement[] = [];
            dataPage.items.forEach(data => {
                if (data.type != dataType) {
                    // FIXME move filters into backend server!
                    // return;
                }
                const option = document.createElement('option');
                option.text = `${rootUrl}${data.download}`;
                optionNodes.push(option);
            });
            datalist?.append(...optionNodes);
        });
    }

    private observeMutation(mutations: MutationRecord[], observer: MutationObserver) {
        const node = mutations[0].target as HTMLDivElement;
        const forms = node.querySelectorAll('form.qhana-form') as NodeListOf<HTMLFormElement>;
        forms.forEach(form => {
            const privateInputs: Set<string> = new Set();
            const dataInputs: Set<string> = new Set();
            form.querySelectorAll('input[data-private],input[type=password]').forEach(inputElement => {
                const name = inputElement.getAttribute('name');
                if (name == null) {
                    console.warn('Input of plugin ui form has no specified name but is private!', inputElement);
                } else {
                    privateInputs.add(name);
                }
            });
            form.querySelectorAll('input[data-input]').forEach(inputElement => {
                const name = inputElement.getAttribute('name');
                if (name == null) {
                    console.warn('Input of plugin ui form has no specified name but is marked as input data!', inputElement);
                } else {
                    dataInputs.add(name);
                }
                this.instrumentDataInputElement(inputElement as HTMLInputElement);
            });
            form.onsubmit = ev => this.onMicrofrontendSubmit(ev, privateInputs, dataInputs);
        });

    }

    private onMicrofrontendSubmit(event: Event, privateInputs: Set<string>, dataInputs: Set<string>) {
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
        if (formAction.pathname.startsWith('/experiments/') || formAction.pathname.endsWith('/ui/') || formAction.pathname.endsWith('/ui') || formAction.pathname === '/') {
            this.updateMicroFrontend(formData, formMethod);
        } else {
            this.submitMicroFrontend(formAction, formData, privateInputs, dataInputs);
        }
    }

    private updateMicroFrontend(formData: FormData, method: string | null) {
        const plugin = this.plugin;
        if (plugin == null) {
            return;
        }
        console.log(method);
        let observable: Observable<string>;
        if (method == null || method === '' || method === 'get' || method === 'GET') {
            observable = this.plugins.getPluginUiWithData(plugin, formData);
        } else {
            if (method !== 'post' && method !== 'POST') {
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

    private submitMicroFrontend(formAction: URL, formData: FormData, privateInputs: Set<string>, dataInputs: Set<string>) {
        const plugin = this.plugin;
        const experimentId = this.experimentId;
        if (plugin == null || experimentId == null) {
            return;
        }

        const pluginUrl = new URL(plugin.url);
        const pluginEndpointUrl = pluginUrl.origin + formAction.pathname;
        console.log(pluginEndpointUrl);

        const inputData: Set<string> = new Set();
        const processedFormData = new FormData();
        formData.forEach((entry, key) => {
            if (privateInputs.has(key)) {
                processedFormData.append(key, '****');
                return;
            }
            processedFormData.append(key, entry);
            if (dataInputs.has(key) && (typeof entry === 'string')) {
                inputData.add(entry);
            }
        });

        const observable: Observable<any> = this.plugins.postPluginTask(pluginEndpointUrl, formData);
        observable.pipe(
            mergeMap(response => {
                const timelineStepData: TimelineStepPostData = {
                    resultLocation: response.url,
                    inputData: [...inputData],

                    processorName: plugin.pluginDescription.name,
                    processorVersion: plugin.pluginDescription.version,
                    processorLocation: plugin.url,
                    parameters: (new URLSearchParams(processedFormData as any)).toString(),
                    parametersContentType: 'application/x-www-form-urlencoded',
                    parametersDescriptionLocation: `${plugin.url}ui/`,
                };
                return this.backend.createTimelineStep(experimentId, timelineStepData);
            }),
        ).subscribe(timelineStep => this.router.navigate(['/experiments', experimentId, 'timeline', timelineStep.sequence.toString()]));
    }

}
