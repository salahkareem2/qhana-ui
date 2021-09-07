/*
 * Copyright 2021 University of Stuttgart
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
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
        this.backend.getPluginEndpoints().subscribe(pluginEndpoints => {
            var observables: Observable<QhanaPlugin>[] = [];
            pluginEndpoints.items.map(pluginEndpoint => {
                if (pluginEndpoint.type === "PluginRunner") {
                    observables.push(this.loadPluginsFromPluginRunner(pluginEndpoint.url));
                } else if (pluginEndpoint.type === "Plugin") {
                    // TODO refactor into method
                    const observable = this.http.get<PluginDescription>(pluginEndpoint.url).pipe(
                        map(pluginMetadata => {
                            return {
                                url: pluginEndpoint.url,
                                pluginDescription: {
                                    apiRoot: pluginEndpoint.url,
                                    name: pluginMetadata.name,
                                    version: pluginMetadata.version,
                                    identifier: pluginMetadata.identifier,
                                },
                                metadata: pluginMetadata,
                            };
                        }),
                    );
                    observables.push(observable);
                } else {
                    console.warn(`Unknown Plugin Endpoint type ${pluginEndpoint.type}.`, pluginEndpoint);
                }
            });
            from(observables).pipe(
                mergeAll(),
                toArray(),
            ).subscribe(plugins => {
                plugins.sort((a, b) => {
                    if (a.pluginDescription.name > b.pluginDescription.name) {
                        return 1;
                    }
                    if (a.pluginDescription.name < b.pluginDescription.name) {
                        return -1;
                    }
                    if (a.pluginDescription.version > b.pluginDescription.version) {
                        return 1;
                    }
                    if (a.pluginDescription.version < b.pluginDescription.version) {
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

    public postPluginTask(pluginEndpoint: string, formData: FormData) {
        return this.http.post<HttpResponse<{ taskId: string }>>(pluginEndpoint, new URLSearchParams(formData as any), { observe: "response", headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    }


}
