import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ChangeUiTemplateComponent } from 'src/app/dialogs/change-ui-template/change-ui-template.component';
import { DeleteDialog } from 'src/app/dialogs/delete-dialog/delete-dialog.dialog';
import { ApiLink, CollectionApiObject, PageApiObject } from 'src/app/services/api-data-types';
import { PluginRegistryBaseService } from 'src/app/services/registry.service';
import { TemplateTabApiObject } from 'src/app/services/templates.service';
import { TemplateApiObject } from 'src/app/services/templates.service';

@Component({
    selector: 'qhana-experiment-workspace-detail',
    templateUrl: './experiment-workspace-detail.component.html',
    styleUrls: ['./experiment-workspace-detail.component.sass']
})
export class ExperimentWorkspaceDetailComponent implements OnInit {

    templateId: string | null = null;
    tabId: string | null | undefined = null;
    templateObject: TemplateApiObject | null = null;
    tabObject: TemplateTabApiObject | null = null;
    templateLink: ApiLink | null = null;
    tabLink: ApiLink | null = null;
    templateTabLinks: ApiLink[] = [];
    createTabOpen: boolean = true;

    // TODO: add validators
    templateForm: FormGroup = this.fb.group({
        name: ["", Validators.required],
        description: "",
        sortKey: 0,
        filterString: "{}"
    });

    constructor(private route: ActivatedRoute, private router: Router, private registry: PluginRegistryBaseService, private fb: FormBuilder, private dialog: MatDialog) { }

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


        this.registry.deletedApiObjectSubject
            .pipe(filter(deletedObject => deletedObject.deleted.resourceType === "ui-template" || deletedObject.deleted.resourceType === "ui-template-tab"))
            .subscribe(deletedObject => {
                if (deletedObject.deleted.resourceKey?.uiTemplateId === this.templateId) {
                    this.templateId = deletedObject.deleted.resourceType === "ui-template" ? null : this.templateId;
                    this.tabId = deletedObject.deleted.resourceKey?.uiTemplateTabId === this.tabId ? null : this.tabId;
                    this.router.navigate([], {
                        relativeTo: this.route,
                        preserveFragment: true,
                        queryParams: {
                            template: this.templateId,
                            plugin: null,
                            tab: this.tabId,
                        },
                        queryParamsHandling: 'merge',
                    });
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

    selectTab(tabId: string | null) {

        if (tabId === 'new') {
            this.createTabOpen = true;
            tabId = null;
        } else {
            this.createTabOpen = false;
        }
        this.router.navigate([], {
            relativeTo: this.route,
            preserveFragment: true,
            queryParams: {
                tab: tabId
            },
            queryParamsHandling: 'merge',
        });
    }

    async deleteTemplate() {
        // TODO: same as in growing-list.component.ts:onDeleteItem -> refactor
        if (this.templateLink == null) {
            return;
        }
        const itemResponse = await this.registry.getByApiLink(this.templateLink, null, false);
        const deleteLink = itemResponse?.links?.find(link => link.rel.some(rel => rel === "delete")) ?? null;

        if (deleteLink == null) {
            console.info(`Cannot delete ApiObject ${this.templateLink}. No delete link found!`);
            return; // cannot delete!
        }

        const dialogRef = this.dialog.open(DeleteDialog, {
            data: this.templateLink,
        });

        const doDelete = await dialogRef.afterClosed().toPromise();
        if (doDelete) {
            this.registry.submitByApiLink(deleteLink);
        }

        // TODO: deselect template
        // this.selectTemplate(null);
    }

    async updateTemplate() {
        if (this.templateLink == null) {
            return;
        }

        let template: TemplateApiObject | null = null;
        let updateLink: ApiLink | null = null;
        let response = await this.registry.getByApiLink<TemplateApiObject>(this.templateLink);
        template = response?.data ?? null;
        updateLink = response?.links?.find(link => link.rel.some(rel => rel === "update") && link.resourceType == "ui-template") ?? null;

        const dialogRef = this.dialog.open(ChangeUiTemplateComponent, { data: { template: template }, minWidth: "20rem", maxWidth: "40rem", width: "60%" });
        const templateData: TemplateApiObject = await dialogRef.afterClosed().toPromise();

        if (!templateData) {
            return;
        }

        if (updateLink) {
            this.registry.submitByApiLink<TemplateApiObject>(updateLink, templateData);
        }
    }
}
