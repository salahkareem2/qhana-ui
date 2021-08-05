import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { CurrentExperimentService } from 'src/app/services/current-experiment.service';
import { PluginsService, QhanaPlugin } from 'src/app/services/plugins.service';

@Component({
    selector: 'qhana-experiment-workspace',
    templateUrl: './experiment-workspace.component.html',
    styleUrls: ['./experiment-workspace.component.sass']
})
export class ExperimentWorkspaceComponent implements OnInit, OnDestroy {

    private routeSubscription: Subscription | null = null;

    pluginList: Observable<QhanaPlugin[]> | null = null;

    constructor(private route: ActivatedRoute, private experiment: CurrentExperimentService, private plugins: PluginsService) { }

    ngOnInit(): void {
        this.routeSubscription = this.route.params.subscribe(params => this.experiment.setExperimentId(params?.experimentId ?? null));
        this.plugins.loadPlugins();
        this.pluginList = this.plugins.plugins;
    }

    ngOnDestroy(): void {
        this.routeSubscription?.unsubscribe();
    }

}
