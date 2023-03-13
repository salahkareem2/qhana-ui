// TODO move other specific data types here?

import { ApiObject, isApiObject } from "./api-data-types";

export interface DataDescription {
    required?: boolean;
    dataType: string;
    contentType: string[];
}

export interface OutputDataDescription extends DataDescription {
    name?: string;
}

export interface InputDataDescription extends DataDescription {
    parameter: string,
}

export interface PluginDependency {
    required?: boolean;
    parameter?: string;

    name?: string;
    version?: string;

    pluginType?: string;

    tags?: string[];
}

export interface PluginEntryPoint {
    href: string;
    uiHref: string;

    dataInput: InputDataDescription[];
    dataOutput: OutputDataDescription[];

    pluginDependencies: PluginDependency[];
}

export interface PluginApiObject extends ApiObject {
    href: string;
    identifier: string;
    version: string;
    title: string;
    description: string;
    pluginType: string;
    tags: string[];
    entryPoint: PluginEntryPoint;
}


export function isPluginApiObject(obj: any): obj is PluginApiObject {
    if (!isApiObject(obj)) {
        return false;
    }
    if (obj.self.resourceType !== "plugin") {
        return false;
    }
    if ((obj as PluginApiObject)?.identifier == null) {
        return false;
    }
    if ((obj as PluginApiObject)?.version == null) {
        return false;
    }
    if ((obj as PluginApiObject)?.title == null) {
        return false;
    }
    if ((obj as PluginApiObject)?.description == null) {
        return false;
    }
    if ((obj as PluginApiObject)?.tags == null) {
        return false;
    }
    if ((obj as PluginApiObject)?.entryPoint == null) {
        return false;
    }
    return true;
}

