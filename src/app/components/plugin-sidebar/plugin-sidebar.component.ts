import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiLink, ApiObject, ApiResponse, CollectionApiObject, PageApiObject } from 'src/app/services/api-data-types';
import { PluginRegistryBaseService } from 'src/app/services/registry.service';

interface PluginGroup {
    name: string;
    description?: string;
    open: boolean;
    link: ApiLink;
    query?: URLSearchParams;
}

interface TemplateApiObject extends ApiObject {  // TODO move somewhere else
    name: string;
    description: string;
    tags: string[];
    groups: ApiLink[];
}

interface TemplateTabApiObject extends ApiObject {  // TODO move somewhere else
    name: string;
    description: string;
    sortKey: number;
    pluginsFilter: string;
    plugins: ApiLink;
}

@Component({
    selector: 'qhana-plugin-sidebar',
    templateUrl: './plugin-sidebar.component.html',
    styleUrls: ['./plugin-sidebar.component.sass']
})
export class PluginSidebarComponent implements OnInit, OnDestroy {

    sidebarOpen: boolean = false;

    activeArea: 'search' | 'templates' | 'plugins' = 'search';

    activeGroup: PluginGroup | null = null;

    selectedTemplate: ApiLink | null = null;
    selectedTemplateName: string | "All Plugins" = "All Plugins";

    highlightedTemplates: Set<string> = new Set();

    highlightedPlugins: Set<string> = new Set();

    defaultPluginGroups: PluginGroup[] = [];

    pluginGroups: PluginGroup[] = this.defaultPluginGroups;

    // route params
    templateId: string | null = null;
    pluginId: string | null = null;

    private routeParamSubscription: Subscription | null = null;

    @ViewChild('searchInput', { static: true }) searchInput: ElementRef<HTMLInputElement> | null = null;

    constructor(private route: ActivatedRoute, private router: Router, private registry: PluginRegistryBaseService) { }

    ngOnInit(): void {
        this.route.queryParamMap.subscribe(params => {
            this.templateId = params.get('template');
            this.pluginId = params.get('plugin');
            if (this.templateId != null) {
                this.highlightedTemplates = new Set<string>([this.templateId]);
            } else {
                this.highlightedTemplates.clear();
            }
            if (this.pluginId != null) {
                this.highlightedPlugins = new Set<string>([this.pluginId]);
            } else {
                this.highlightedPlugins.clear();
            }
            this.loadActiveTemplateFromId(this.templateId);
        });
        this.registry.resolveRecursiveRels([["plugin", "collection"]]).then((apiLink) => {
            const pluginTypes = new Map<string, string>([["processing", "Processing Plugins"], ["conversion", "Conversion Plugins"], ["visualization", "Visualization Plugins"]]);
            pluginTypes.forEach((name, pluginType) => {
                const query = new URLSearchParams();
                query.set("type", pluginType)
                this.defaultPluginGroups.push({
                    name: name,
                    open: true,
                    link: apiLink,
                    query: query,
                });
            });
        });
    }

    ngOnDestroy(): void {
        this.routeParamSubscription?.unsubscribe();
    }

    private async loadActiveTemplateFromId(newTemplateId: string | null) {
        if (newTemplateId == null) {
            this.switchActiveTemplateLink(null);
            return;
        }
        const activeTemplateId = this.selectedTemplate?.resourceKey?.uiTemplateId ?? null;
        if (newTemplateId === activeTemplateId) {
            // nothing to do, link already loaded
            return;
        }
        // need to fetch template api link from plugin registry
        this.pluginGroups = []; // hide default plugin groups while template is loading
        const query = new URLSearchParams();
        query.set("template-id", newTemplateId);
        const templatePage = await this.registry.getByRel<PageApiObject>([["ui-template", "collection"]], query, true);
        if (templatePage?.data.collectionSize === 1) {
            // only expect one template since IDs are unique
            this.switchActiveTemplateLink(templatePage.data.items[0]);
        } else {
            console.warn(`Template API returned an ambiguous response for template id ${this.templateId}`, templatePage);
        }
    }

    private switchActiveTemplateLink(activeTemplate: ApiLink | null) {
        if (activeTemplate == null) {
            this.selectedTemplate = null;
            this.selectedTemplateName = "All Plugins";
            this.activeArea = "plugins";
            this.pluginGroups = this.defaultPluginGroups;
            return;
        }
        this.selectedTemplate = activeTemplate;
        this.selectedTemplateName = activeTemplate.name ?? "Unknown";
        this.activeArea = "plugins";
        this.loadPluginTemplate(activeTemplate);
    }

    private async loadPluginTemplate(activeTemplate: ApiLink) {
        const pluginGroups: PluginGroup[] = [];
        this.pluginGroups = pluginGroups;
        const templateResponse = await this.registry.getByApiLink<TemplateApiObject>(activeTemplate);
        const workspaceGroupLink = templateResponse?.data?.groups?.find(group => group.resourceKey?.["?group"] === "workspace");
        if (workspaceGroupLink == null) {
            return;
        }
        const tabsResponse = await this.registry.getByApiLink<CollectionApiObject>(workspaceGroupLink);
        const tabLinks = tabsResponse?.data?.items ?? [];
        const tabPromises = tabLinks.map(link => this.registry.getByApiLink<TemplateTabApiObject>(link));
        const tabs = await Promise.all(tabPromises);
        const sortedTabs = tabs
            .filter(t => t != null)
            .sort((a, b) => (a?.data?.sortKey ?? 0) - (b?.data?.sortKey ?? 0)) as ApiResponse<TemplateTabApiObject>[];
        sortedTabs.forEach(tab => {
            pluginGroups.push({
                name: tab.data.name,
                open: true,
                description: tab.data.description,
                link: tab.data.plugins,
            });
        });

    }

    switchActiveArea(newArea: 'search' | 'templates' | 'plugins', group?: PluginGroup) {
        if (this.activeArea === newArea && this.sidebarOpen) {
            // potentially close sidebar
            if (this.activeArea !== 'plugins' || this.activeGroup === group) {
                // only close sidebar if the active button has not changed
                this.sidebarOpen = false;
                return;
            }
        }
        this.sidebarOpen = true;
        this.activeArea = newArea;
        this.activeGroup = group ?? null;

        if (group != null) {
            group.open = true;
        }

        if (newArea === "search") {
            // set focus on search field
            this.searchInput?.nativeElement?.focus();
        }
    }

    togglePluginGroup(group: PluginGroup, event: Event) {
        event.preventDefault();
        const newState = !group.open;
        group.open = newState;
        if (newState === true) {
            this.switchActiveArea("plugins", group);
        } else {
            this.switchActiveArea("plugins");
        }
    }

    toggleTemplateHeader(event: Event) {
        event?.preventDefault();
        if (this.activeArea === "templates") {
            this.switchActiveArea("plugins");
        } else {
            this.switchActiveArea("templates");
        }
    }

    selectTemplate(templateLink: ApiLink | null) {
        this.switchActiveTemplateLink(templateLink);
        if (templateLink == null) {
            this.router.navigate([], {
                relativeTo: this.route,
                preserveFragment: true,
                queryParams: {
                    template: null,
                },
                queryParamsHandling: 'merge',
            });
            return;
        }
        this.router.navigate([], {
            relativeTo: this.route,
            preserveFragment: true,
            queryParams: {
                template: templateLink.resourceKey?.uiTemplateId ?? null,
            },
            queryParamsHandling: 'merge',
        });
    }

    selectPlugin(pluginLink: ApiLink) {
        let pluginId = pluginLink.resourceKey?.pluginId ?? null;
        if (pluginId != null) {
            if (this.pluginId != null && this.pluginId === pluginId) {
                // double click deselects plugin
                pluginId = null;
            }
            this.router.navigate([], {
                relativeTo: this.route,
                preserveFragment: true,
                queryParams: {
                    template: this.templateId,
                    plugin: pluginId,
                },
                queryParamsHandling: 'merge',
            });
        }
        this.activeArea = "plugins";
        this.sidebarOpen = pluginId == null; // always close sidebar after successfully selecting plugin
    }

}
