import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TrackByFunction } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { from, isObservable, Observable, Subject, Subscription } from 'rxjs';
import { concatMap, filter } from 'rxjs/operators';
import { DeleteDialog } from 'src/app/dialogs/delete-dialog/delete-dialog.dialog';
import { ApiLink, ApiObject, isCollectionApiObject, matchesLinkRel } from 'src/app/services/api-data-types';
import { PluginRegistryBaseService } from 'src/app/services/registry.service';

@Component({
    selector: 'qhana-growing-list',
    templateUrl: './growing-list.component.html',
    styleUrls: ['./growing-list.component.sass']
})
export class GrowingListComponent implements OnInit, OnDestroy {
    @Input() rels: string[] | string[][] | null = null;
    @Input() newItemRels: string | string[] | null = null;
    @Input() apiLink: ApiLink | null = null;

    @Input() set search(value: string | null) {
        this.normalizedSearch = value?.toLowerCase()?.trim() ?? null;
    }

    normalizedSearch: string | null = null;

    @Input() editButton: boolean = false;
    @Input() deleteButton: boolean = false;

    @Input() noDefaultDeleteAction: boolean = false;

    @Input() itemModel: string = "default";

    @Input() highlighted: Set<string> = new Set();
    @Input() highlightByKey: string | null = null;

    @Output() itemsChanged: EventEmitter<ApiLink[]> = new EventEmitter<ApiLink[]>();
    @Output() clickItem: EventEmitter<ApiLink> = new EventEmitter<ApiLink>();
    @Output() editItem: EventEmitter<ApiLink> = new EventEmitter<ApiLink>();
    @Output() deleteItem: EventEmitter<ApiLink> = new EventEmitter<ApiLink>();

    private startApiLink: ApiLink | null = null;
    loadMoreApiLink: ApiLink | null = null;
    isLoading: boolean = false;
    loadMoreClicked: boolean = false;

    private updateQueue: Subject<() => Promise<unknown> | Observable<unknown>> = new Subject();

    private updateQueueSubscription: Subscription | null = null;
    private newItemsSubscription: Subscription | null = null;
    private changedItemsSubscription: Subscription | null = null;
    private deletedItemsSubscription: Subscription | null = null;

    items: ApiLink[] = [];

    constructor(private registry: PluginRegistryBaseService, private dialog: MatDialog) { }

    ngOnInit(): void {
        if (this.apiLink != null) {
            this.replaceApiLink(this.apiLink);
            return;
        }
        const rels = this.rels
        if (rels != null) {
            this.registry.resolveRecursiveRels(rels).then((apiLink) => this.replaceApiLink(apiLink));
        }

        this.updateQueueSubscription = this.updateQueue.pipe(concatMap(callback => {
            const result = callback();
            if (isObservable(result)) {
                return result;
            }
            return from(result);
        })).subscribe();

        // handle api updates
        const newItemRels = this.newItemRels;
        if (newItemRels) {
            this.newItemsSubscription = this.registry.newApiObjectSubject
                .pipe(filter(newObject => matchesLinkRel(newObject.new, newItemRels)))
                .subscribe(newObject => this.updateQueue.next(() => this.onNewObjectQueued(newObject.new)));
        }
        this.changedItemsSubscription = this.registry.changedApiObjectSubject
            .pipe(filter(changedObject => this.items.some(item => item.href === changedObject.changed.href)))
            .subscribe(changedObject => this.updateQueue.next(() => this.onChangedObjectQueued(changedObject.changed)));
        this.deletedItemsSubscription = this.registry.deletedApiObjectSubject
            .pipe(filter(deletedObject => this.items.some(item => item.href === deletedObject.deleted.href)))
            .subscribe(deletedObject => this.updateQueue.next(() => this.onDeletedObjectQueued(deletedObject.deleted)));
    }

    ngOnDestroy(): void {
        this.updateQueueSubscription?.unsubscribe();
        this.newItemsSubscription?.unsubscribe();
        this.changedItemsSubscription?.unsubscribe();
        this.deletedItemsSubscription?.unsubscribe();
    }

    replaceApiLink(newApiLink: ApiLink): void {
        if (newApiLink.href === this.startApiLink?.href) {
            // nothing changed, nothing to do
            return;
        }
        if (!matchesLinkRel(newApiLink, "page") && !matchesLinkRel(newApiLink, "collection")) {
            console.warn("The given api link does not correspond to a collection resource!", this.apiLink);
            return;
        }
        if (newApiLink.rel.some(rel => rel === "page") && !newApiLink.rel.some(rel => rel === "page-1")) {
            console.warn("The given api link does not correspond to the first page of a paginated collection resource!", this.apiLink);
        }
        this.loadMoreApiLink = null;
        this.updateQueue.next(() => this.replaceApiLinkQueued(newApiLink));
    }

    reloadAll() {
        const reloadApiLink = this.startApiLink;
        if (reloadApiLink == null) {
            return;
        }
        this.loadMoreApiLink = null;
        this.updateQueue.next(() => this.replaceApiLinkQueued(reloadApiLink));
    }

    async replaceApiLinkQueued(newApiLink: ApiLink) {
        if (this.isLoading) {
            console.error("Cannot chang base api link while loading.");
            return; // should not happen if called correctly via update queue
        }
        this.isLoading = true;
        const response = await this.registry.getByApiLink<ApiObject>(newApiLink);
        if (response == null) {
            console.error("Api did not respond.", newApiLink);
            this.isLoading = false;
            return;
        }
        if (!isCollectionApiObject(response.data)) {
            console.error("Api response is not a collection resource.", response);
            this.isLoading = false;
            return;
        }
        this.startApiLink = newApiLink;
        this.items = [...response.data.items];
        this.loadMoreApiLink = response.links.find(link => matchesLinkRel(link, "next")) ?? null;
        this.isLoading = false;
        this.loadMoreClicked = false;
        this.itemsChanged.emit([...this.items]);
    }

    loadMore() {
        this.loadMoreClicked = true;
        this.updateQueue.next(() => this.loadMoreQueued());
    }

    async loadMoreQueued() {
        if (this.isLoading) {
            return; // should not happen if
        }
        const nextLink = this.loadMoreApiLink;
        if (nextLink == null) {
            return;
        }
        this.isLoading = true;
        const items = this.items;
        const response = await this.registry.getByApiLink<ApiObject>(nextLink);
        if (response == null) {
            console.error("Api did not respond.", nextLink);
            this.isLoading = false;
            return;
        }
        if (!isCollectionApiObject(response.data)) {
            console.error("Api response is not a collection resource.", response);
            this.loadMoreApiLink = null;
            this.isLoading = false;
            return;
        }
        this.items = [...items, ...response.data.items];
        this.loadMoreApiLink = response.links.find(link => matchesLinkRel(link, "next")) ?? null;
        this.isLoading = false;
        this.loadMoreClicked = false;
        this.itemsChanged.emit([...this.items]);
    }

    private async onNewObjectQueued(newObjectLink: ApiLink) {
        this.items = [...this.items, newObjectLink];
        this.itemsChanged.emit([...this.items]);
    }

    private async onChangedObjectQueued(changedObjectLink: ApiLink) {
        const existing = this.items.find(link => link.href === changedObjectLink.href);
        if (existing && existing.name !== changedObjectLink.name) {
            // only update here if the name has changed! (as this component only directly deals with the api links)
            const newItems = [...this.items];
            const index = newItems.findIndex(link => link.href === changedObjectLink.href);
            if (index < 0) {
                return;
            }
            newItems[index] = changedObjectLink;
            this.items = newItems;
            this.itemsChanged.emit([...this.items]);
        }
    }

    private async onDeletedObjectQueued(deletedObjectLink: ApiLink) {
        const newItems = this.items.filter(link => link.href !== deletedObjectLink.href);
        if (newItems.length === this.items.length) {
            return; // nothing filtered
        }
        this.items = newItems;
        this.itemsChanged.emit([...this.items]);
    }

    trackBy: TrackByFunction<ApiLink> = (index, item: ApiLink): string => {
        return item.href;
    }

    isHighlighted(link: ApiLink): boolean {
        if (this.highlightByKey) {
            const testValue = link.resourceKey?.[this.highlightByKey];
            return testValue != null && this.highlighted.has(testValue);
        }
        return this.highlighted.has(link.href);
    }

    isInSearch(link: ApiLink): boolean {
        const search = this.normalizedSearch;
        if (search == null || search === "") {
            return true;
        }
        return link.name?.toLowerCase()?.includes(search) ?? false;
    }

    onItemClick(link: ApiLink) {
        this.clickItem.emit(link);
    }

    onItemEditClick(link: ApiLink) {
        this.editItem.emit(link);
    }

    onItemDeleteClick(link: ApiLink) {
        this.deleteItem.emit(link);
        if (this.noDefaultDeleteAction) {
            return;
        }
        this.onDeleteItem(link);
    }

    private async onDeleteItem(link: ApiLink) {
        const itemResponse = await this.registry.getByApiLink(link, null, false);
        const deleteLink = itemResponse?.links?.find(link => link.rel.some(rel => rel === "delete")) ?? null;

        if (deleteLink == null) {
            console.info(`Cannot delete ApiObject ${link}. No delete link found!`);
            return; // cannot delete!
        }

        const dialogRef = this.dialog.open(DeleteDialog, {
            data: link,
        });

        const doDelete = await dialogRef.afterClosed().toPromise();
        if (doDelete) {
            this.registry.submitByApiLink(deleteLink);
        }
    }
}
