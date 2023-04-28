import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiLink, CollectionApiObject, PageApiObject } from 'src/app/services/api-data-types';
import { PluginRegistryBaseService } from 'src/app/services/registry.service';
import { TemplateTabApiObject } from 'src/app/services/templates.service';
import { TemplateApiObject } from 'src/app/services/templates.service';

@Component({
    selector: 'qhana-template-details',
    templateUrl: './template-details.component.html',
    styleUrls: ['./template-details.component.sass']
})
export class TemplateDetailsComponent implements OnInit {
    templateId: string | null = null;
    tabId: string | null = null;
    templateObject: TemplateApiObject | null = null;
    tabObject: TemplateTabApiObject | null = null;
    templateLink: ApiLink | null = null;
    tabLink: ApiLink | null = null;
    templateTabLinks: ApiLink[] = [];
    
    // TODO: add validators
    templateForm: FormGroup = this.fb.group({
        name: ["", Validators.required],
        description: "",
        sortKey: 0,
        filterString: "{}"
    });

    constructor(private route: ActivatedRoute, private registry: PluginRegistryBaseService, private fb: FormBuilder) { }

    ngOnInit() { 
        this.route.queryParamMap.subscribe(async params => {
            let templateId = params.get('template');
            let tabId = params.get('tab');

            if (templateId && templateId !== this.templateId) {
                this.templateId = templateId;
                const query = new URLSearchParams();
                query.set("template-id", templateId);
                const templateResponse = await this.registry.getByRel<PageApiObject>([["ui-template", "collection"]], query, true);
                if (templateResponse?.data?.items?.length === 1) {
                    this.templateLink = templateResponse.data.items[0]
                } else {
                    console.warn("Template not found");
                    return;
                }
                const template = await this.registry.getByApiLink<TemplateApiObject>(this.templateLink);
                this.templateObject = template?.data ?? null;
                const workspaceGroupLink = template?.data?.groups?.find(group => group.resourceKey?.["?group"] === "workspace");
                if (workspaceGroupLink == null) {
                    console.warn("Workspace not found");
                    return;
                }
                const tabsResponse = await this.registry.getByApiLink<CollectionApiObject>(workspaceGroupLink);
                this.templateTabLinks = tabsResponse?.data?.items ?? [];
            }
            if (tabId !== this.tabId) {
                this.tabId = tabId;
                this.tabLink = this.templateTabLinks.find(link => link.resourceKey?.["uiTemplateTabId"] === tabId) ?? null;
                if (this.tabLink == null) {
                    console.warn("Tab not found");
                    return;
                }
                const tab = await this.registry.getByApiLink<TemplateTabApiObject>(this.tabLink);
                this.tabObject = tab?.data ?? null;
                if (this.tabObject != null) {
                    this.templateForm.patchValue(this.tabObject);
                }
            }
        });
    }

    onSubmit() {
        if (!this.tabLink) {
            return;
        }
        this.registry.getByApiLink<TemplateTabApiObject>(this.tabLink).then(response => {
            let updateLink = response?.links?.find(link => link.rel.some(rel => rel === "update") && link.resourceType == "ui-template-tab") ?? null;
            if (updateLink) {
                this.registry.submitByApiLink<TemplateTabApiObject>(updateLink, {
                    name: this.templateForm.value.name,
                    description: this.templateForm.value.description,
                    sortKey: this.templateForm.value.sortKey,
                    filterString: this.templateForm.value.filterString,
                    location: "workspace"
                });
            }
        });
    }
}
