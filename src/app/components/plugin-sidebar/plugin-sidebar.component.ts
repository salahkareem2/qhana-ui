import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiLink } from 'src/app/services/api-data-types';

@Component({
    selector: 'qhana-plugin-sidebar',
    templateUrl: './plugin-sidebar.component.html',
    styleUrls: ['./plugin-sidebar.component.sass']
})
export class PluginSidebarComponent implements OnInit, OnDestroy {

    sidebarOpen: boolean = false;

    activeArea: 'search' | 'templates' | 'plugins' = 'search';

    selectedTemplate: ApiLink | null = null;
    selectedTemplateName: string | "All Plugins" = "All Plugins";

    highlightedTemplates: Set<string> = new Set();

    highlightedPlugins: Set<string> = new Set();

    // route params
    templateId: string | null = null;
    pluginId: string | null = null;

    private routeParamSubscription: Subscription | null = null;

    @ViewChild('searchInput', { static: true }) searchInput: ElementRef<HTMLInputElement> | null = null;

    constructor(private route: ActivatedRoute, private router: Router) { }

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
        });
    }

    ngOnDestroy(): void {
        this.routeParamSubscription?.unsubscribe();
    }

    switchActiveArea(newArea: 'search' | 'templates' | 'plugins') {
        if (this.activeArea === newArea && this.sidebarOpen) {
            this.sidebarOpen = false;
            return;
        }
        this.sidebarOpen = true;
        this.activeArea = newArea;

        if (newArea === "search") {
            // set focus on search field
            this.searchInput?.nativeElement?.focus();
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
        if (templateLink == null) {
            this.selectedTemplate = null;
            this.selectedTemplateName = "All Plugins";
            this.activeArea = "plugins";
            console.log(this.activeArea);
            return;
        }
        this.selectedTemplate = templateLink;
        this.selectedTemplateName = templateLink.name ?? "Unknown";
        this.activeArea = "plugins";
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
