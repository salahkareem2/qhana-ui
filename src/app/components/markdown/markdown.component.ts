import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { commandsCtx, defaultValueCtx, Editor, editorStateCtx, editorViewCtx, editorViewOptionsCtx, parserCtx, rootCtx, schemaCtx, themeToolCtx } from '@milkdown/core';
import { clipboard } from '@milkdown/plugin-clipboard';
import { cursor } from '@milkdown/plugin-cursor';
import { diagram } from '@milkdown/plugin-diagram';
import { emoji } from '@milkdown/plugin-emoji';
import { history } from '@milkdown/plugin-history';
import { indent } from '@milkdown/plugin-indent';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { math } from '@milkdown/plugin-math';
import { prism } from '@milkdown/plugin-prism';
import { createDropdownItem, defaultActions, slash, slashPlugin } from '@milkdown/plugin-slash';
import { WrappedAction } from '@milkdown/plugin-slash/lib/src/item';
import { tooltip } from '@milkdown/plugin-tooltip';
import { gfm } from '@milkdown/preset-gfm';
import { nord } from '@milkdown/theme-nord';
import { MarkdownHelpDialog } from 'src/app/dialogs/markdown-help/markdown-help.component';


@Component({
    selector: 'qhana-markdown',
    templateUrl: './markdown.component.html',
    styleUrls: ['./markdown.component.sass']
})
export class MarkdownComponent implements OnChanges {

    @Input() markdown: string = "";
    @Input() editable: boolean = false;
    @Input() showHelp: boolean = true;

    @Output() markdownChanges: EventEmitter<string> = new EventEmitter();

    @ViewChild('milkdown') editorRef: ElementRef | null = null;

    private editor: Editor | null = null;

    constructor(public dialog: MatDialog) { }

    ngAfterViewInit() {
        try {
            // try to fix problems with whitespace in css variables declaration...
            // whitespace trips up mermaid diagram rendering but there is no clear place
            // where that whitespace is introduced...
            const styleRoot = getComputedStyle(document.documentElement);
            const bg = styleRoot.getPropertyValue("--background");
            if (bg.length > bg.trim().length) {
                document.documentElement.style.setProperty("--background", bg.trim())
            }
        } catch { /* I don't care about errors here */ }

        const nativeElement = this.editorRef?.nativeElement;

        if (nativeElement != null) {

            Editor.make()
                .config((ctx) => {
                    ctx.set(rootCtx, nativeElement);
                    ctx.set(editorViewOptionsCtx, { editable: () => this.editable ?? false });
                    ctx.set(defaultValueCtx, this.markdown);
                    ctx.get(listenerCtx).markdownUpdated((ctx, markdown) => {
                        if (this.editable) {
                            this.markdownChanges.emit(markdown)
                        }
                    });
                })
                .use(nord)
                .use(gfm)
                .use(prism)
                .use(diagram)
                .use(math)
                .use(clipboard)
                .use(listener)
                .use(history)
                .use(cursor)
                .use(emoji)
                .use(indent)
                .use(tooltip)
                .use(slash.configure(slashPlugin, {
                    config: (ctx) => {

                        const extraActions: Array<WrappedAction & { keyword: string[]; typeName: string }> = [
                            {
                                id: 'diagram',
                                dom: createDropdownItem(ctx.get(themeToolCtx), 'Diagram', 'code'),
                                command: () => ctx.get(commandsCtx).callByName('TurnIntoDiagram'),
                                keyword: ['diagram', 'mermaid'],
                                typeName: 'diagram',
                            },
                        ]

                        // Define a status builder
                        return ({ isTopLevel, content, parentNode, state }) => {
                            // You can only show something at root level
                            if (!isTopLevel) return null;

                            // Empty content ? Set your custom empty placeholder !
                            if (!content) {
                                const node = state.selection.$from.node();
                                if (state.selection.$from.node().content.size === 0) {
                                    return { placeholder: 'Type / to use the slash commands...' };
                                }
                            }

                            // Define the placeholder & actions (dropdown items) you want to display depending on content
                            if (content.startsWith('/')) {
                                const { nodes } = ctx.get(schemaCtx);
                                const userInput = content.slice(1).toLocaleLowerCase();
                                const filteredActions = extraActions.filter((action) => !!nodes[action.typeName] && action.keyword.some((keyword) => keyword.includes(userInput)))
                                    .map(({ keyword, typeName, ...action }) => action);

                                return content === '/'
                                    ? {
                                        placeholder: 'Type to filter...',
                                        // Get default slash plugin items
                                        actions: [...defaultActions(ctx), ...filteredActions],
                                    }
                                    : {
                                        // get the filtered actions list
                                        actions: [...defaultActions(ctx, content), ...filteredActions],
                                    };
                            }

                            return null;
                        };
                    }
                }))
                .create()
                .then(editor => this.editor = editor);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        // FIXME add forced state update once milkdown is updated
        if (changes.markdown != null) {
            // FIXME use provided milkdown action to replace the document once milkdown is updated
            this.editor?.action((ctx) => {
                const parser = ctx.get(parserCtx); // get parser and parse markdown
                const nodes = parser(this.markdown);
                if (nodes != null) {
                    const oldState = ctx.get(editorStateCtx);
                    const transaction = oldState.tr // create new transaction
                    transaction.replaceWith(0, transaction.doc.content.size - 1, nodes); // replace the whole document
                    const view = ctx.get(editorViewCtx);
                    view.dispatch(transaction); // update view
                    ctx.set(editorStateCtx, oldState.apply(transaction)) // update editor state seperately
                }
            });
        }
    }

    showMarkdownHelp() {
        this.dialog.open(MarkdownHelpDialog, {});
    }

}
