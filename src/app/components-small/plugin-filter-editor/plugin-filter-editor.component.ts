import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ApiLink } from 'src/app/services/api-data-types';
import { PluginRegistryBaseService } from 'src/app/services/registry.service';
import { TemplateTabApiObject } from 'src/app/services/templates.service';

@Component({
    selector: 'qhana-plugin-filter-editor',
    templateUrl: './plugin-filter-editor.component.html',
    styleUrls: ['./plugin-filter-editor.component.sass']
})
export class PluginFilterEditorComponent implements OnInit {
    @Input() tabLink: ApiLink | null = null;

    filterString: string = "{}";
    filterControl = new FormControl(this.filterString, [Validators.required, Validators.minLength(2)]);  // TODO: Add validator for JSON

    filterObject: any = null;

    constructor(private registry: PluginRegistryBaseService) { }

    ngOnInit(): void {
        if (this.tabLink == null) {
            console.warn("No tab link provided to plugin filter node component");
            return;
        }
        this.registry.getByApiLink<TemplateTabApiObject>(this.tabLink).then(response => {
            this.filterString = response?.data?.filterString ?? this.filterString;
            this.filterObject = JSON.parse(this.filterString);
        });
    }

    updateFilter(event: [number, any]) {
        const [index, value] = event;
        this.filterObject = value;
        this.filterString = JSON.stringify(this.filterObject, null, 2);
        this.filterControl.setValue(this.filterString);
    }

    copyFilterString() {
        navigator.clipboard.writeText(this.filterString);
    }

    updateFilterEditor() {
        const filterValue = this.filterControl.value;
        if (filterValue == null) {
            return;
        }
        if (this.filterControl.valid) {
            this.filterObject = JSON.parse(filterValue);
            this.filterString = filterValue;
        }
    }
}
