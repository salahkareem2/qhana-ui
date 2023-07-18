import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';

type FilterType = 'and' | 'or' | 'name' | 'tag' | 'version';

@Component({
    selector: 'qhana-plugin-filter-node',
    templateUrl: './plugin-filter-node.component.html',
    styleUrls: ['./plugin-filter-node.component.sass']
})
export class PluginFilterNodeComponent implements OnInit {
    @Input() filterIn: any;
    @Input() depth: number = 0;
    @Output() filterOut = new EventEmitter<any>();
    @Output() delete = new EventEmitter<void>();

    filterObject: any = {};
    type: FilterType | null = null;
    children: any[] | null = null;
    value: string | null = null;
    inverted: boolean = false;
    isEmpty: boolean = true;

    constructor() { }

    ngOnInit(): void {
        this.setupFilter();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.filterIn.previousValue != null) {
            this.setupFilter();
        }
    }

    setupFilter() {
        this.isEmpty = Object.keys(this.filterIn).length === 0;
        this.filterObject = { ...this.filterIn };
        const filter = this.filterObject.not ?? this.filterObject;
        this.inverted = this.filterObject.not != null;
        if (filter == null) {
            console.warn("No filter object provided to plugin filter node component");
            return;
        }
        // Should filters have multiple attributes at some point, this must be changed
        const type = Object.keys(filter)[0];
        // TODO: check for empty filter (currently prints warning)
        if (type !== 'and' && type !== 'or' && type !== 'name' && type !== 'tag' && type !== 'version') {
            console.warn("Invalid filter type provided to plugin filter node component");
            return;
        }
        this.type = type as FilterType;
        const isLeaf = filter.and == null && filter.or == null;
        if (isLeaf) {
            this.value = filter[this.type];
        } else {
            this.children = filter[this.type];
        }
    }

    updateFilterObject() {
        if (this.type == null) {
            console.warn("No type provided to plugin filter node component");
            return;
        }
        const filter = { ...this.filterObject };
        if (this.inverted) {
            filter.not[this.type] = this.children ?? this.value;
        } else {
            filter[this.type] = this.children ?? this.value;
        }
        this.filterOut.emit(filter);
    }

    setFilter(type: FilterType) {
        const isLeaf = type !== 'and' && type !== 'or';
        this.type = type;
        this.children = isLeaf ? null : [];
        this.value = isLeaf ? "" : null;
        this.updateFilterObject();
        this.isEmpty = false;
    }

    deleteChild(index: number) {
        if (this.children == null) {
            console.warn("Cannot delete child filter: Filter has no children!");
            return;
        }
        this.children.splice(index, 1);
        this.updateFilterObject();
    }

    addFilter(type: FilterType = 'name') {
        if (this.children == null) {
            console.warn("Cannot add child filter because the plugin filter node component is a leaf node!");
            return;
        }
        const filterValue = (type === 'and' || type === 'or') ? [] : "";
        this.children.push({ [type]: filterValue });
        this.updateFilterObject();
    }

    updateChild(value: any, index: number) {
        if (this.children == null) {
            console.warn("No children provided to plugin filter node component");
            return;
        }
        if (value == null) {
            this.children.splice(index, 1);
        } else {
            this.children[index] = value;
        }
        this.updateFilterObject();
    }

    changeType(type: FilterType) {
        if (type == null || this.type === type) {
            return;
        }
        const filter = { ...(this.filterObject.not ?? this.filterObject) };
        const isLeaf = type !== 'and' && type !== 'or';
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
        this.filterOut.emit(filter);
    }

    updateFilterString(event: any) {
        this.value = event.target.value;
        this.updateFilterObject();
    }

    invertFilter(event: any) {
        this.inverted = event.checked;
        if (this.inverted) {
            this.filterObject = { not: this.filterObject };
        } else {
            this.filterObject = this.filterObject.not;
        }
        this.filterOut.emit({ ...this.filterObject });
    }
}
