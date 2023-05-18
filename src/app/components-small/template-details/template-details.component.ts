import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiLink } from 'src/app/services/api-data-types';
import { PluginRegistryBaseService } from 'src/app/services/registry.service';
import { TemplateApiObject, TemplateTabApiObject } from 'src/app/services/templates.service';

@Component({
    selector: 'qhana-template-details',
    templateUrl: './template-details.component.html',
    styleUrls: ['./template-details.component.sass']
})
export class TemplateDetailsComponent implements OnInit {
    @Input() templateLink: ApiLink | null = null;
    @Input() tabLink: ApiLink | null = null;

    private initialValues = {
        name: "",
        description: "",
        sortKey: 0,
        filterString: "{}"
    };

    // TODO: Since the new UI is no longer in the workspace sidebar, it is reasonable to manage tabs for other locations
    templateForm: FormGroup = this.fb.group({
        name: ["", Validators.required],
        description: "",
        sortKey: 0,
        filterString: ["{}", Validators.minLength(2)] // TODO: validate using JSON schema
    });

    constructor(private registry: PluginRegistryBaseService, private fb: FormBuilder) { }

    ngOnInit() {
        if (this.tabLink != null) {
            this.registry.getByApiLink<TemplateTabApiObject>(this.tabLink).then(response => {
                this.templateForm.setValue({
                    name: response?.data?.name ?? "",
                    description: response?.data?.description ?? "",
                    sortKey: response?.data?.sortKey ?? 0,
                    filterString: response?.data?.filterString ?? "{}"
                });
            });
        }
    }

    async onSubmit() {
        let findString: string;
        let response;
        if (this.templateLink != null) {
            findString = "create";
            response = await this.registry.getByApiLink<TemplateApiObject>(this.templateLink);
        } else if (this.tabLink != null) {
            response = await this.registry.getByApiLink<TemplateTabApiObject>(this.tabLink);
            findString = "update";
        } else {
            console.warn("TemplateDetailsComponent: neither templateLink nor tabLink is set");
            return;
        }
        const link = response?.links?.find(link => link.rel.some(rel => rel === findString) && link.resourceType == "ui-template-tab") ?? null;
        if (link != null) {
            this.registry.submitByApiLink<TemplateTabApiObject>(link, {
                name: this.templateForm.value.name,
                description: this.templateForm.value.description,
                sortKey: this.templateForm.value.sortKey,
                filterString: this.templateForm.value.filterString,
                location: "workspace"
            });
            if (this.templateLink != null) {
                this.templateForm.reset(this.initialValues);
                this.templateForm.controls.name.setErrors(null);
            }
        }
    }
}
