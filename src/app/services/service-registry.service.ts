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

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ApiObject, isApiObject } from './api-data-types';
import { EnvService } from './env.service';
import { PluginRegistryBaseService } from './registry.service';



export interface ServiceApiObject extends ApiObject {
    serviceId: string;
    name: string;
    description: string;
    url: string;
}

export function isServiceApiObject(obj: any): obj is ServiceApiObject {
    if (!isApiObject(obj)) {
        return false;
    }
    if (obj.self.resourceType !== "service") {
        return false;
    }
    if ((obj as ServiceApiObject)?.serviceId == null) {
        return false;
    }
    if ((obj as ServiceApiObject)?.name == null) {
        return false;
    }
    if ((obj as ServiceApiObject)?.description == null) {
        return false;
    }
    if ((obj as ServiceApiObject)?.url == null) {
        return false;
    }
    return true;
}

@Injectable({
    providedIn: 'root'
})
export class ServiceRegistryService {

    private registrySubscription: Subscription | null = null;
    private urlMapSubscription: Subscription | null = null;

    private experimentBackendRootUrl: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

    private latexRendererServiceUrl: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

    public get backendRootUrl(): Observable<string | null> {
        return this.experimentBackendRootUrl.asObservable();
    }

    public get latexRendererUrl(): Observable<string | null> {
        return this.latexRendererServiceUrl.asObservable();
    }

    constructor(private registryService: PluginRegistryBaseService, private envService: EnvService) {
        this.subscribe();
        // just kick off get, updates are handled by subscription setup above
        this.registryService.getByRel([["service", "collection"]], new URLSearchParams([["service-id", "qhana-backend,latex-renderer"]]), true);
    }

    private unsubscribe() {
        this.registrySubscription?.unsubscribe();
        this.urlMapSubscription?.unsubscribe();
    }

    private subscribe() {
        this.registrySubscription = this.registryService.apiObjectSubject.subscribe((apiObject => {
            if (apiObject.self.resourceType !== "service") {
                return;  // only look at service api objects
            }
            if (isServiceApiObject(apiObject)) {
                if (apiObject.serviceId === "qhana-backend") {
                    this.updateQhanaBackendUrl(apiObject.url);
                }
                if (apiObject.serviceId === "latex-renderer") {
                    this.updateLatexRendererUrl(apiObject.url);
                }
            }
        }));
        this.envService.urlMap.subscribe(() => this.onUrlMapUpdate());
    }

    private updateQhanaBackendUrl(newUrl: string | null) {
        let oldUrl = this.experimentBackendRootUrl.value;
        if (newUrl != null) { // pass urls through url map
            newUrl = this.envService.mapUrl(newUrl);
        }
        if (newUrl !== oldUrl) {
            this.experimentBackendRootUrl.next(newUrl);
        }
    }

    private updateLatexRendererUrl(newUrl: string | null) {
        const oldUrl = this.latexRendererServiceUrl.value;
        if (newUrl != null) { // pass urls through url map
            newUrl = this.envService.mapUrl(newUrl);
        }
        if (newUrl !== oldUrl) {
            this.latexRendererServiceUrl.next(newUrl);
        }
    }

    private onUrlMapUpdate() {
        // update with current value in case url map transforms this value!
        this.updateQhanaBackendUrl(this.experimentBackendRootUrl.value);
        this.updateLatexRendererUrl(this.latexRendererServiceUrl.value);
    }


}
