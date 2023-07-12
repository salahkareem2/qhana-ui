import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
    selector: 'qhana-plugin-filter-node',
    templateUrl: './plugin-filter-node.component.html',
    styleUrls: ['./plugin-filter-node.component.sass']
})
export class PluginFilterNodeComponent implements OnInit {
    @Input() filterObject: any;
    @Input() index: number = 0;
    @Input() depth: number = 0;
    @Output() childChange = new EventEmitter<[number, any]>();

    type: 'and' | 'or' | 'name' | 'tag' | 'version' | null = null;
    children: any[] | null = null;
    value: string | null = null;
    inverted: boolean = false;

    constructor() { }

    ngOnInit(): void {
        this.setupFilter();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.filterObject != null) {
            this.setupFilter();
        }
    }

    setupFilter() {
        const currentValue = this.filterObject;
        const filter = currentValue.not ?? this.filterObject;
        this.inverted = currentValue.not != null;
        if (filter == null) {
            console.warn("No filter object provided to plugin filter node component");
            return;
        }
        const isLeaf = (filter.name != null) || filter.tag || filter.version;
        if (isLeaf) {
            this.type = filter.version ? 'version' : filter.tag ? 'tag' : 'name';
            this.value = filter.name ?? filter.tag ?? filter.version;
        } else {
            this.type = filter.and ? 'and' : 'or';
            this.children = filter.and ?? filter.or;
        }
        this.filterObject = currentValue;
        this.childChange.emit([this.index, this.filterObject]);
    }

    setFilter(type: 'name' | 'tag' | 'version' | 'and' | 'or') {
        const isLeaf = type === 'name' || type === 'tag' || type === 'version';
        this.type = type;
        this.children = isLeaf ? null : [];
        this.value = isLeaf ? "" : null;
        this.updateFilterObject();
    }

    deleteFilter() {
        if (this.depth === 0) {
            this.type = null;
            this.children = null;
            this.value = null;
            this.inverted = false;
            this.filterObject = {};
        } else {
            this.filterObject = null;
        }
        this.childChange.emit([this.index, this.filterObject]);
    }

    addFilter(type: 'name' | 'tag' | 'version' | 'and' | 'or' = 'name') {
        if (this.children == null) {
            console.warn("Cannot add child filter because the plugin filter node component is a leaf node!");
            return;
        }
        this.children.push({
            [type]: type === 'and' || type === 'or' ? [] : ""
        });
        this.updateFilterObject();
    }

    updateFilterObject() {
        if (this.type == null) {
            console.warn("No type provided to plugin filter node component");
            return;
        }
        const filter = this.filterObject.not ?? this.filterObject;
        filter[this.type] = this.children ?? this.value;
        this.childChange.emit([this.index, this.filterObject]);
    }

    updateChild(event: [number, any]) {
        if (this.children == null) {
            console.warn("No children provided to plugin filter node component");
            return;
        }
        const [index, value] = event;
        if (value == null) {
            this.children.splice(index, 1);
        } else {
            this.children[index] = value;
        }
        this.updateFilterObject();
    }

    changeType(type: 'name' | 'tag' | 'version' | 'and' | 'or') {
        if (type == null) {
            return;
        }
        const filter = this.filterObject.not ?? this.filterObject;
        const isLeaf = type === 'name' || type === 'tag' || type === 'version';
        if (this.type != null) {
            delete filter[this.type]
        }
        this.type = type;
        if (isLeaf) {
            this.children = null;
            filter[type] = this.value ?? "";
        } else {
            this.value = null;
            filter[type] = this.children ?? [];
        }
        this.childChange.emit([this.index, this.filterObject]);
    }

    updateFilterString(event: any) {
        this.value = event.target.value;
        this.updateFilterObject();
    }

    invertFilter() {
        this.inverted = !this.inverted;
        if (this.inverted) {
            this.filterObject = { not: this.filterObject };
        } else {
            this.filterObject = this.filterObject.not;
        }
        this.childChange.emit([this.index, this.filterObject]);
    }

    isFilterEmpty(): boolean {
        const filter = this.filterObject.not ?? this.filterObject;
        return Object.keys(filter).length === 0;
    }
}
