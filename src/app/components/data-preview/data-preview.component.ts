import { Component, Input, OnChanges } from '@angular/core';
import { ApiResponse, CollectionApiObject } from 'src/app/services/api-data-types';
import { EnvService } from 'src/app/services/env.service';
import { PluginApiObject } from 'src/app/services/qhana-api-data-types';
import { ExperimentDataApiObject, QhanaBackendService, TimelineStepApiObject, TimelineSubStepApiObject } from 'src/app/services/qhana-backend.service';
import { PluginRegistryBaseService } from 'src/app/services/registry.service';


interface PreviewOption {
    type: "internal" | "plugin";
    name: string;
}

interface InternalPreviewOption extends PreviewOption {
    type: "internal";
    previewType: string;
    specificity: number;
    isAvailableFor: (dataType: string | null, contentType: string | null) => boolean;
}

interface PluginPreviewOption extends PreviewOption {
    type: "plugin";
    plugin: PluginApiObject;
}

function isDataApiObject(input: ExperimentDataApiObject | TimelineStepApiObject | TimelineSubStepApiObject): input is ExperimentDataApiObject {
    if ((input as any).contentType != null && (input as any).download != null) {
        return true;
    }
    return false;
}

function isStepLikeApiObject(input: ExperimentDataApiObject | TimelineStepApiObject | TimelineSubStepApiObject): input is TimelineStepApiObject | TimelineSubStepApiObject {
    if ((input as any).parametersContentType != null && (input as any).parameters != null) {
        return true;
    }
    return false;
}

interface PreviewData {
    url: string;
    contentType: string;
    dataType: string;
}

const INTERNAL_PREVIEWS: InternalPreviewOption[] = [
    {
        type: 'internal',
        name: "Text Preview",
        previewType: "text-iframe",
        specificity: 0,
        isAvailableFor(dataType: string | null, contentType: string | null): boolean {
            if (contentType == null) {
                return false;
            }
            if (contentType.startsWith("text/html") || contentType.startsWith("text/csv")) {
                return false;
            }
            if (contentType.startsWith("text/") || contentType == "text") {
                return true;
            }
            return false;
        },
    },
    {
        type: 'internal',
        name: "Text Preview",
        previewType: "raw-text",
        specificity: 0,
        isAvailableFor(dataType: string | null, contentType: string | null): boolean {
            if (contentType == null) {
                return false;
            }
            if (contentType.startsWith("text/html")) {
                return true;
            }
            if (contentType.startsWith("text/csv")) {
                return true;
            }
            if (contentType.startsWith("application/x-www-form-urlencoded")) {
                return true;
            }
            if (contentType.startsWith("application/json")) {
                return true;
            }
            if (contentType.startsWith("application/X-lines+json")) {
                return true;
            }
            // TODO expand
            return false;
        },
    },
    {
        type: 'internal',
        name: "Markdown Preview",
        previewType: "markdown",
        specificity: 100,
        isAvailableFor(dataType: string | null, contentType: string | null): boolean {
            return contentType?.startsWith("text/markdown") ?? false;
        },
    },
    {
        type: 'internal',
        name: "HTML Preview",
        previewType: "html-iframe",
        specificity: 10,
        isAvailableFor(dataType: string | null, contentType: string | null): boolean {
            return contentType?.startsWith("text/html") ?? false;
        },
    },
    {
        type: 'internal',
        name: "Parameter Preview",
        previewType: "query-params",
        specificity: 100,
        isAvailableFor(dataType: string | null, contentType: string | null): boolean {
            return contentType?.startsWith("application/x-www-form-urlencoded") ?? false;
        },
    },
    {
        type: 'internal',
        name: "Image Preview",
        previewType: "image",
        specificity: 0,
        isAvailableFor(dataType: string | null, contentType: string | null): boolean {
            if (contentType == null) {
                return false;
            }
            if (contentType.startsWith("image/") || contentType == "image") {
                return true;
            }
            return false;
        },
    },
]

@Component({
    selector: 'qhana-data-preview',
    templateUrl: './data-preview.component.html',
    styleUrls: ['./data-preview.component.sass']
})
export class DataPreviewComponent implements OnChanges {

    @Input() data: ExperimentDataApiObject | TimelineStepApiObject | TimelineSubStepApiObject | null = null;

    previewData: PreviewData | null = null;

    builtinPreviewOptions: InternalPreviewOption[] = [];
    pluginPreviewOptions: PluginPreviewOption[] = [];
    chosenPreview: PluginPreviewOption | InternalPreviewOption | null = null;
    downloadUrl: string | null = null;

    constructor(private backend: QhanaBackendService, private env: EnvService, private registry: PluginRegistryBaseService) { }

    ngOnChanges(): void {
        let previewData: PreviewData | null = null;
        if (this.data == null) {
            // todo nothing to preview
        } else if (isDataApiObject(this.data)) {
            let url = this.data.download
            if (this.data.download.startsWith("/")) {
                url = this.backend.backendRootUrl + url;
            }
            previewData = {
                url: url,
                dataType: this.data.type,
                contentType: this.data.contentType,
            };
        } else if (isStepLikeApiObject(this.data)) {
            let url = ""
            if (this.data.parameters && this.data.parameters.startsWith("/")) {
                url = this.backend.backendRootUrl + this.data.parameters;
            } else if (this.data.parameters) {
                url = this.data.parameters
            } else {
                // should not happen
            }
            previewData = {
                url: url,
                dataType: "parameters",
                contentType: this.data.parametersContentType ?? "",
            };
        }
        this.previewData = previewData;
        this.updateData();
    }

    async updateData() {
        const contentType = this.previewData?.contentType ?? null;
        const dataType: string | null = this.previewData?.dataType ?? null;

        if (contentType == null) {
            this.builtinPreviewOptions = [];
            this.pluginPreviewOptions = [];
            this.chosenPreview = null;
            return;
        }

        const builtinPreviewOptions: InternalPreviewOption[] = INTERNAL_PREVIEWS.filter((p) => p.isAvailableFor(dataType, contentType));

        let bestBuiltinPreview: InternalPreviewOption | null = null;
        builtinPreviewOptions.forEach((option) => {
            if (option.specificity > (bestBuiltinPreview?.specificity ?? -1)) {
                bestBuiltinPreview = option;
            }
        });


        const downloadUrl = this.previewData?.url;
        if (downloadUrl) {
            this.builtinPreviewOptions = builtinPreviewOptions;
            this.pluginPreviewOptions = [];
            this.chosenPreview = bestBuiltinPreview ?? null;
            const mappedUrl = this.env.mapUrl(downloadUrl);
            this.downloadUrl = mappedUrl;

            const query = new URLSearchParams();
            query.set("type", "visualization");
            if (dataType != null) {
                query.set("input-data-type", dataType);
            }
            if (contentType != null) {
                query.set("input-content-type", contentType);
            }

            const previewPlugins = await this.registry.getByRel<CollectionApiObject>(["plugin", "collection"], query)

            const pluginPromises = previewPlugins?.data.items.map(pluginLink => this.registry.getByApiLink<PluginApiObject>(pluginLink, null, false));

            Promise.all(pluginPromises ?? []).then((responses) => this.updatePluginPreviewOptions(responses))
        } else {
            this.builtinPreviewOptions = [];
            this.pluginPreviewOptions = [];
            this.chosenPreview = null;
            this.downloadUrl = null;
        }
    }

    private updatePluginPreviewOptions(responses: (ApiResponse<PluginApiObject> | null)[]) {
        const filteredApiObjects = responses.filter(apiObject => apiObject != null) as ApiResponse<PluginApiObject>[];

        const pluginPreviewOptions: PluginPreviewOption[] = filteredApiObjects.map(apiObject => {
            return {
                type: 'plugin',
                name: apiObject.data.title ?? apiObject.data.identifier,
                plugin: apiObject.data
            }
        });

        this.pluginPreviewOptions = pluginPreviewOptions;

        if (this.chosenPreview == null || (this.chosenPreview.type == 'internal' && this.chosenPreview.specificity === 0)) {
            this.chosenPreview = pluginPreviewOptions[0] ?? this.chosenPreview;
        }
    }

    // TODO maybe refactor plugin preview into own component
    getPreviewUrl(chosenPreview: InternalPreviewOption | PluginPreviewOption): string | null {
        if (chosenPreview.type == "internal") {
            return null;
        }

        const data = this.previewData;
        const plugin = chosenPreview.plugin;
        let frontendUrl: string | null = plugin?.entryPoint?.uiHref;
        if (frontendUrl != null) {
            const base = new URL(plugin?.href ?? "");
            // const pluginOrigin = base.origin;
            if (frontendUrl.startsWith("/")) {
                frontendUrl = base.origin + frontendUrl;
            }
            if (frontendUrl.startsWith("./")) {
                frontendUrl = base.href + frontendUrl;
            }
        }
        if (frontendUrl == null) {
            return null;
        }
        const url = new URL(frontendUrl);
        const dataInput: any[] = plugin?.entryPoint?.dataInput ?? [];
        dataInput.forEach(input => {
            // TODO better matcher
            if (input.required && input.contentType.some((requiredType: string) => requiredType === data?.contentType)) {
                url.searchParams.set(input.parameter, data?.url ?? "");
            }
        });
        return url.toString();
    }

}
