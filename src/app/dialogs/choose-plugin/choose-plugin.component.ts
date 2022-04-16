import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { PluginsService, QhanaPlugin } from 'src/app/services/plugins.service';

interface PluginRestrictions {
    pluginTags: string[];
    pluginName?: string;
    pluginVersion?: string;
}

@Component({
    selector: 'qhana-choose-plugin',
    templateUrl: './choose-plugin.component.html',
    styleUrls: ['./choose-plugin.component.sass']
})
export class ChoosePluginComponent implements OnInit {

    unfilteredPlugins: QhanaPlugin[] = [];
    pluginList: QhanaPlugin[] = [];

    constructor(public dialogRef: MatDialogRef<ChoosePluginComponent>, @Inject(MAT_DIALOG_DATA) public data: PluginRestrictions, private pluginsService: PluginsService) { }

    ngOnInit(): void {
        this.pluginsService.plugins.pipe(take(1)).subscribe((pluginList => {
            this.unfilteredPlugins = pluginList
        }));
    }

    filterPluginList() {
        const requiredTags = this.data.pluginTags.filter((tag) => !tag.startsWith("!"));
        const forbiddenTags = new Set(this.data.pluginTags.filter((tag) => tag.startsWith("!")));
        const pluginName = this.data.pluginName;
        const versionMatcher = this.getVersionMatcher(this.data.pluginVersion);

        this.pluginList = this.unfilteredPlugins.filter(p => {
            if (!requiredTags.every(tag => p.metadata.tags.some((t: string) => t === tag))) {
                return false; // a required tag was not present
            }
            if (p.metadata.tags.some((t: string) => forbiddenTags.has(t))) {
                return false; // a forbidden tag was present
            }
            if (pluginName && p.pluginDescription.name !== pluginName) {
                return false; // the plugin name does not match
            }
            if (!versionMatcher(p.pluginDescription.version)) {
                return false; // the plugin version does not match
            }
            return true;
        });
    }

    // FIXME actually implement version matching logic!
    private getVersionMatcher(version?: string): (version: string) => boolean {
        return (version) => true;
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onOk(): void {
        this.dialogRef.close();
    }

}
