import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import { catchError, map, mergeAll, mergeMap, toArray } from 'rxjs/operators';
import { QhanaBackendService } from './qhana-backend.service';

export interface PluginDescription {
    apiRoot: string;
    name: string;
    version: string;
    identifier: string;
}

export interface QhanaPlugin {
    url: string;
    pluginDescription: PluginDescription;
    metadata: any;
}

@Injectable({
    providedIn: 'root'
})
export class PluginsService {

    private loading: boolean = false;

    private pluginList: QhanaPlugin[] = [];

    private pluginsSubject: BehaviorSubject<QhanaPlugin[]> = new BehaviorSubject<QhanaPlugin[]>([]);

    get plugins() {
        return this.pluginsSubject.asObservable();
    }

    constructor(private http: HttpClient, private backend: QhanaBackendService) { }

    loadPlugins() {
        if (this.loading) {
            return;
        }
        this.loading = true;
        this.backend.getPluginRunners().subscribe(pluginRunners => {
            var observables = pluginRunners.items.map(pluginRunner => this.loadPluginsFromPluginRunner(pluginRunner));
            from(observables).pipe(
                mergeAll(),
                toArray(),
            ).subscribe(plugins => {
                plugins.sort((a, b) => {
                    if (a.pluginDescription.name > a.pluginDescription.name) {
                        return 1;
                    }
                    if (a.pluginDescription.name < a.pluginDescription.name) {
                        return -1;
                    }
                    if (a.pluginDescription.version > a.pluginDescription.version) {
                        return 1;
                    }
                    if (a.pluginDescription.version < a.pluginDescription.version) {
                        return -1;
                    }
                    return 0;
                })
                this.pluginList = plugins;
                this.pluginsSubject.next(plugins);
                this.loading = false;
            });
        });
    }

    private loadPluginsFromPluginRunner(pluginRunnerUrl: string) {
        return this.http.get<{ plugins: PluginDescription[] }>(`${pluginRunnerUrl}/plugins`).pipe(
            mergeMap(pluginsResponse => from(pluginsResponse.plugins)),
            mergeMap(plugin => this.loadPluginMetadata(plugin)),
            catchError(err => {
                console.log(err);
                return [];
            })
        );
    }

    private loadPluginMetadata(plugin: PluginDescription) {
        return this.http.get<QhanaPlugin>(plugin.apiRoot).pipe(
            map(pluginMetadata => {
                return {
                    url: plugin.apiRoot,
                    pluginDescription: plugin,
                    metadata: pluginMetadata,
                };
            }),
        );
    }

    public getPluginUi(plugin: QhanaPlugin) {
        return this.http.get(`${plugin.url}ui`, { responseType: 'text' });
    }

    public getPluginUiWithData(plugin: QhanaPlugin, formData: FormData) {
        const query = (new URLSearchParams(formData as any)).toString();
        return this.http.get(`${plugin.url}ui?${query}`, { responseType: 'text' });
    }

    public postPluginUiWithData(plugin: QhanaPlugin, formData: FormData) {
        return this.http.post(`${plugin.url}ui/`, new URLSearchParams(formData as any), { responseType: 'text', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    }


}
