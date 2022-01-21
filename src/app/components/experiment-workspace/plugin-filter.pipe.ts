import { Pipe, PipeTransform } from '@angular/core';
import { QhanaPlugin } from 'src/app/services/plugins.service';

@Pipe({
    name: 'pluginFilter'
})
export class PluginFilterPipe implements PipeTransform {

    transform(plugins: QhanaPlugin[] | null, searchValue: string): QhanaPlugin[] {
        if (plugins) {
            if (!searchValue) {
                return plugins
            } else {
                return plugins.filter(plugin => this.pluginFilter(plugin, searchValue))
            }
        } else {
            return []
        }
    }

    pluginFilter(plugin: QhanaPlugin, searchValue: string): boolean {
        if (plugin.pluginDescription.name.includes(searchValue) ||
            plugin.pluginDescription.apiRoot.includes(searchValue) ||
            plugin.pluginDescription.name.includes(searchValue) ||
            plugin.pluginDescription.version.includes(searchValue) ||
            plugin.pluginDescription.identifier.includes(searchValue) ||
            (plugin.metadata.title && plugin.metadata.title.includes(searchValue))
        ) {
            return true;
        }
        return false
    }
}