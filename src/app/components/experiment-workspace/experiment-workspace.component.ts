import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
<<<<<<< HEAD
import { Observable, Subscription, of } from 'rxjs';
import { map } from "rxjs/operators";
=======
import { Observable, Subscription } from 'rxjs';
>>>>>>> origin/feature/microfrontend-refactor
import { CurrentExperimentService } from 'src/app/services/current-experiment.service';
import { PluginsService, QhanaPlugin } from 'src/app/services/plugins.service';
import { QhanaBackendService } from 'src/app/services/qhana-backend.service';
import { FormSubmitData } from '../plugin-uiframe/plugin-uiframe.component';

@Component({
    selector: 'qhana-experiment-workspace',
    templateUrl: './experiment-workspace.component.html',
    styleUrls: ['./experiment-workspace.component.sass']
})
export class ExperimentWorkspaceComponent implements OnInit, OnDestroy {

    private routeSubscription: Subscription | null = null;

    experimentId: string | null = null;

<<<<<<< HEAD
    searchValue: string = "";
=======
>>>>>>> origin/feature/microfrontend-refactor
    pluginList: Observable<QhanaPlugin[]> | null = null;
    filteredPluginList: Observable<QhanaPlugin[]> | null = null;

    activePlugin: QhanaPlugin | null = null;
    frontendUrl: string | null = null;

    constructor(private route: ActivatedRoute, private experiment: CurrentExperimentService, private plugins: PluginsService, private backend: QhanaBackendService, private router: Router) { }

    ngOnInit(): void {
        this.routeSubscription = this.route.params.subscribe(params => {
            this.experimentId = params?.experimentId ?? null;
            this.experiment.setExperimentId(params?.experimentId ?? null);
        });
        this.plugins.loadPlugins();
        this.pluginList = this.plugins.plugins;
        this.filteredPluginList = this.pluginList;
    }

    ngOnDestroy(): void {
        this.routeSubscription?.unsubscribe();
    }

<<<<<<< HEAD
    changeFilterPluginList(): void {
        let searchValue: string = this.searchValue.toLowerCase();
        if (this.pluginList == null || !this.searchValue || this.searchValue.trim() === "") {
            this.filteredPluginList = this.pluginList;
        } else {
            if (this.pluginList !== null && this.searchValue) {
                this.pluginList.pipe(
                    map(pluginList =>
                        pluginList.filter(plugin => {
                            console.log(plugin.metadata);
                            return (plugin.pluginDescription.name.toLowerCase().includes(searchValue) ||
                                plugin.pluginDescription.apiRoot.toLowerCase().includes(searchValue) ||
                                plugin.pluginDescription.version.toLowerCase().includes(searchValue) ||
                                plugin.pluginDescription.identifier.toLowerCase().includes(searchValue) ||
                                (plugin.metadata.title && plugin.metadata.title.toLowerCase().includes(searchValue)) ||
                                (plugin.metadata.tags && plugin.metadata.tags.some((tag: string) => tag.toLowerCase().includes(searchValue))))
                        })
                    )
                ).subscribe(pluginList => this.filteredPluginList = of(pluginList));
            }
        }
    }

=======
>>>>>>> origin/feature/microfrontend-refactor
    changeActivePlugin(plugin: QhanaPlugin) {
        if (plugin == null || plugin === this.activePlugin) {
            this.activePlugin = null;
            this.frontendUrl = null;
            return;
        }
        let frontendUrl: string | null = plugin?.metadata?.entryPoint?.uiHref;
        if (frontendUrl != null) {
            const base = new URL(plugin?.url ?? "");
            // const pluginOrigin = base.origin;
            if (frontendUrl.startsWith("/")) {
                frontendUrl = base.origin + frontendUrl;
            }
            if (frontendUrl.startsWith("./")) {
                frontendUrl = base.href + frontendUrl;
            }
        }
        this.activePlugin = plugin;
        this.frontendUrl = frontendUrl;
    }

    onPluginUiFormSubmit(formData: FormSubmitData) {
        const experimentId = this.experimentId;
        const plugin = this.activePlugin;
        const frontendUrl = ""; //this.frontendUrl?.toString();
        if (experimentId == null || plugin == null || frontendUrl == null) {
            return; // should never happen outside of race conditions
        }
        this.backend.createTimelineStep(experimentId, {
            inputData: formData.dataInputs,
            parameters: formData.formData,
            parametersContentType: formData.formDataType,
            processorLocation: plugin.url,
            processorName: plugin.pluginDescription.name,
            processorVersion: plugin.pluginDescription.version,
            resultLocation: formData.resultUrl,
        }).subscribe(timelineStep => this.router.navigate(['/experiments', experimentId, 'timeline', timelineStep.sequence.toString()]));

    }

}
