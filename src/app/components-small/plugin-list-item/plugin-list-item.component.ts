import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ApiLink } from 'src/app/services/api-data-types';
import { PluginApiObject } from 'src/app/services/qhana-api-data-types';
import { PluginRegistryBaseService } from 'src/app/services/registry.service';

@Component({
    selector: 'qhana-plugin-list-item',
    templateUrl: './plugin-list-item.component.html',
    styleUrls: ['./plugin-list-item.component.sass']
})
export class PluginListItemComponent implements OnChanges {

    @Input() link: ApiLink | null = null;
    @Input() search: string | null = null;

    isInSearch: boolean = false;

    plugin: PluginApiObject | null = null;

    private searchableString: string = "";

    constructor(private registry: PluginRegistryBaseService) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.link != null) {
            this.updatePluginData();
            return;
        }
        if (changes.search != null) {
            this.updateIsInSearch();
        }
    }

    async updatePluginData() {
        if (this.link == null) {
            this.plugin = null;
            this.searchableString = "";
            this.isInSearch = false;
            return;
        }
        const pluginResponse = await this.registry.getByApiLink<PluginApiObject>(this.link);

        this.plugin = pluginResponse?.data ?? null;
        if (this.plugin != null) {
            this.searchableString = `${this.plugin.identifier.toLowerCase()} ${this.plugin.title.toLowerCase()}${this.plugin.version} ${this.plugin.pluginType} ${this.plugin.tags.join(" ").toLowerCase()}`;
        } else {
            this.searchableString = "";
        }
        this.updateIsInSearch();
    }

    updateIsInSearch() {
        if (this.plugin == null) {
            this.isInSearch = false;
            return;
        }
        if (this.search == null || this.search === "") {
            this.isInSearch = true;
            return;
        }
        if (this.searchableString.includes(this.search)) {
            this.isInSearch = true;
            return;
        }
        this.isInSearch = false;
    }

}
