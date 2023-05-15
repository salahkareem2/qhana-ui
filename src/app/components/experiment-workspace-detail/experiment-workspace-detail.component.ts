import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DeleteDialog } from 'src/app/dialogs/delete-dialog/delete-dialog.dialog';
import { ApiLink, CollectionApiObject, PageApiObject } from 'src/app/services/api-data-types';
import { PluginRegistryBaseService } from 'src/app/services/registry.service';
import { TemplateTabApiObject } from 'src/app/services/templates.service';
import { TemplateApiObject } from 'src/app/services/templates.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
    selector: 'qhana-experiment-workspace-detail',
    templateUrl: './experiment-workspace-detail.component.html',
    styleUrls: ['./experiment-workspace-detail.component.sass']
})
export class ExperimentWorkspaceDetailComponent implements OnInit {

    readonly separatorKeysCodes = [ENTER, COMMA] as const;

    templateId: string | null = null;
    tabId: string | null = null;

    templateObject: TemplateApiObject | null = null;
    tabObject: TemplateTabApiObject | null = null;

    templateLink: ApiLink | null = null;
    tabLink: ApiLink | null = null;
    templateTabLinks: ApiLink[] = [];

    templateTabDescriptions: { [id: string]: string } = { '': '' };

    editTemplateName: string | null = null;
    editTemplateDescription: string | null = null;
    editTemplateTags: string[] = [];

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

                tabsResponse?.data?.items?.forEach(async tabLink => {
                    const tab = await this.registry.getByApiLink<TemplateTabApiObject>(tabLink);
                    if (tabLink.resourceKey?.uiTemplateTabId && tab?.data) {
                        this.templateTabDescriptions[tabLink.resourceKey.uiTemplateTabId] = tab?.data.description ?? '';
                    }
                });
            }
            if (tabId !== this.tabId) {
                this.tabId = tabId;
                this.tabLink = this.templateTabLinks.find(link => link.resourceKey?.["uiTemplateTabId"] === tabId) ?? null;
                if (this.tabLink == null) {
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
                if (deletedObject.deleted.resourceKey?.uiTemplateTabId && deletedObject.deleted.resourceKey?.uiTemplateTabId in this.templateTabDescriptions) {
                    delete this.templateTabDescriptions[deletedObject.deleted.resourceKey?.uiTemplateTabId];
                    this.templateTabLinks = this.templateTabLinks.filter(link => link.resourceKey?.uiTemplateTabId !== deletedObject.deleted.resourceKey?.uiTemplateTabId);
                }
            });

        this.registry.newApiObjectSubject
            .pipe(filter(newObject => newObject.new.resourceType === "ui-template-tab"))
            .subscribe(async newObject => {
                const tabId = newObject.new.resourceKey?.uiTemplateTabId;
                if (tabId != null) {
                    const tab = await this.registry.getByApiLink<TemplateTabApiObject>(newObject.new);
                    this.templateTabDescriptions[tabId] = tab?.data?.description ?? '';
                    this.templateTabLinks.push(newObject.new);
                }
            });

        this.registry.changedApiObjectSubject
            .pipe(filter(changedObject => changedObject.changed.resourceType === "ui-template"))
            .subscribe(async changedObject => {
                if (changedObject.changed.resourceKey?.uiTemplateId === this.templateId) {
                    const template = await this.registry.getByApiLink<TemplateApiObject>(changedObject.changed);
                    this.templateObject = template?.data ?? null;
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
        const id = tabId ? "tab-" + tabId : "new-template-panel"
        this.router.navigate([], {
            relativeTo: this.route,
            preserveFragment: true,
            queryParams: {
                tab: tabId
            },
            queryParamsHandling: 'merge',
        });
        const elmnt = document.getElementById(id);
        if (elmnt) {
            elmnt.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
        }
    }

    editTemplate() {
        this.editTemplateName = this.templateObject?.name ?? null;
        this.editTemplateDescription = this.templateObject?.description ?? null;
        this.editTemplateTags = this.templateObject?.tags ?? [];
    }

    cancelEditTemplate() {
        this.editTemplateName = null;
        this.editTemplateDescription = null;
        this.editTemplateTags = [];
    }

    addTag(event: MatChipInputEvent) {
        const value = event.value;
        if (!value || this.editTemplateTags?.includes(value)) {
            return;
        }
        this.editTemplateTags?.push(value);
        event.chipInput!.clear();
    }

    removeTag(tag: string) {
        const index = this.editTemplateTags.indexOf(tag);
        if (index !== undefined && index > -1) {
            this.editTemplateTags.splice(index, 1);
        }
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
    }

    async updateTemplate() {
        if (this.templateLink == null) {
            console.warn("No template selected");
            return;
        }

        let updateLink: ApiLink | null = null;
        let response = await this.registry.getByApiLink<TemplateApiObject>(this.templateLink);
        updateLink = response?.links?.find(link => link.rel.some(rel => rel === "update") && link.resourceType == "ui-template") ?? null;

        if (updateLink) {
            this.registry.submitByApiLink<TemplateApiObject>(updateLink, {
                name: this.editTemplateName,
                description: this.editTemplateDescription,
                tags: this.editTemplateTags
            });
        }

        this.cancelEditTemplate();
    }
}
