import { Component, OnInit } from '@angular/core';
import { TemplateApiObject } from 'src/app/services/qhana-backend.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiLink } from 'src/app/services/api-data-types';
import { PluginRegistryBaseService } from 'src/app/services/registry.service';

@Component({
    selector: 'qhana-choose-template',
    templateUrl: './choose-template.component.html',
    styleUrls: ['./choose-template.component.sass']
})
export class ChooseTemplateComponent implements OnInit {
    highlightedTemplateSet: Set<string> = new Set();
    templateId: string | null = null;

    constructor(public dialogRef: MatDialogRef<ChooseTemplateComponent>) { }

    ngOnInit(): void {
    }

    async selectTemplate(templateLink: ApiLink) {
        const templateId = templateLink.resourceKey?.uiTemplateId ?? null;
        if (templateId == null) {
            return;
        }
        if (this.highlightedTemplateSet.has(templateId)) {
            // double click deselects template
            this.highlightedTemplateSet.clear();
            this.templateId = null;
            return;
        }
        this.highlightedTemplateSet.clear();
        this.highlightedTemplateSet = new Set([templateId]);
        this.templateId = templateId;
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
