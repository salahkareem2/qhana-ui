import { createCmd, createCmdKey, ThemeInnerEditorType, themeManagerCtx } from '@milkdown/core';
import { InputRule, Node, NodeSelection, setBlockType } from '@milkdown/prose';
import { AtomList, createNode } from '@milkdown/utils';
import { customAlphabet } from 'nanoid';
import { Node as UnistNode } from 'unist';
import { visit } from 'unist-util-visit';

export const nanoid = customAlphabet('abcedfghicklmn', 10);

export const getId = (node?: Node) => node?.attrs?.['identity'] || nanoid();

const createLatexDiv = (contents: string) => ({
    type: 'latex',
    value: contents,
});

const visitCodeBlock = (ast: UnistNode) =>
    visit(ast, 'code', (node, index, parent) => {
        const { lang, value } = node;

        // If this codeblock is not latex, bail.
        if (lang !== 'latex') {
            return node;
        }

        const newNode = createLatexDiv(value);

        if (parent && index != null) {
            (parent as any).children.splice(index, 1, newNode);
        }

        return node;
    });

export const remarkLatex = () => {
    function transformer(tree: UnistNode) {
        visitCodeBlock(tree);
    }

    return transformer;
};

const inputRegex = /^```latex$/;

export type Options = {
    placeholder: {
        empty: string;
        error: string;
    };
    latexRendererUrl: string;
    latexPackages: string[];
    imageFormat: string | "svg" | "pdf" | "png" | "jpg";
};

export const TurnIntoDiagram = createCmdKey('TurnIntoLatex');

export const latexNode = createNode<string, Options>((utils, options) => {
    const id = 'latex';

    const placeholder = {
        empty: 'Empty',
        error: 'LaTex Syntax Error',
        ...(options?.placeholder ?? {}),
    };

    const latexRendererUrl = options?.latexRendererUrl ?? "http://localhost:5030/renderLatex";
    const defaultPackages = options?.latexPackages ?? ["\\usepackage{tikz}", "\\usetikzlibrary{quantikz}"];
    const imageFormat = options?.imageFormat ?? "svg";

    return {
        id,
        schema: () => ({
            content: 'text*',
            group: 'block',
            marks: '',
            defining: true,
            atom: true,
            code: true,
            isolating: true,
            attrs: {
                value: {
                    default: '',
                },
                identity: {
                    default: '',
                },
            },
            parseDOM: [
                {
                    tag: `div[data-type="${id}"]`,
                    preserveWhitespace: 'full',
                    getAttrs: (dom) => {
                        if (!(dom instanceof HTMLElement)) {
                            throw new Error();
                        }
                        return {
                            value: dom.dataset['value'],
                            identity: dom.id,
                        };
                    },
                },
            ],
            toDOM: (node) => {
                const identity = getId(node);
                return [
                    'div',
                    {
                        id: identity,
                        class: utils.getClassName(node.attrs, 'latex'),
                        'data-type': id,
                        'data-value': node.attrs['value'] || node.textContent || '',
                    },
                    0,
                ];
            },
            parseMarkdown: {
                match: ({ type }) => type === id,
                runner: (state, node, type) => {
                    const value = node['value'] as string;
                    state.openNode(type, { value });
                    if (value) {
                        state.addText(value);
                    }
                    state.closeNode();
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === id,
                runner: (state, node) => {
                    state.addNode('code', undefined, node.content.firstChild?.text || '', { lang: 'latex' });
                },
            },
        }),
        commands: (nodeType) => [createCmd(TurnIntoDiagram, () => setBlockType(nodeType, { id: getId() }))],
        view: (ctx) => (node, view, getPos) => {
            const currentId = getId(node);

            let header = '';
            let currentNode = node;

            const renderer = utils.themeManager.get<ThemeInnerEditorType>('inner-editor', {
                view,
                getPos,
                render: (code) => {
                    try {
                        if (!code) {
                            renderer.preview.innerHTML = placeholder.empty;
                        } else {
                            const packagesRegex = /(?<=^\s*)\\use[a-zA-Z]+(\[[^\]]*\])?(\{[^\}]+\})/gm;
                            const packages = packagesRegex.exec(code) ?? defaultPackages;
                            const imageFormatRegex = /(?<=^\s*%\s*format\s*[:=]\s*)([a-zA-Z-]+)(?=>\s*$)/gm;
                            const outputFormat = imageFormatRegex.exec(code)?.[0] ?? imageFormat;
                            const stripImageFormatRegex = /^\s*%\s*format\s*[:=]\s*([a-zA-Z-]+)\s*$/gm;

                            const processedCode = code.replace(packagesRegex, "").replace(stripImageFormatRegex, "");

                            console.log(processedCode, outputFormat);

                            const imageUrl = new URL(latexRendererUrl);
                            imageUrl.searchParams.set("content", processedCode);
                            imageUrl.searchParams.set("output", outputFormat);
                            packages.forEach(latexPackage => {
                                imageUrl.searchParams.append("packages", latexPackage);
                            });

                            renderer.preview.innerHTML = `<img src="${imageUrl}">`;
                        }
                    } catch (err) {
                        console.log(err)
                        const error = document.getElementById('d' + currentId);
                        if (error) {
                            error.remove();
                        }
                        renderer.preview.innerHTML = placeholder.error;
                    } finally {
                        renderer.dom.appendChild(renderer.preview);
                    }
                },
            });

            if (!renderer) return {};

            const { onUpdate, editor, dom, onFocus, onBlur, onDestroy, stopEvent } = renderer;
            editor.dataset['type'] = id;
            dom.classList.add('latex');

            onUpdate(currentNode, true);

            ctx.get(themeManagerCtx).onFlush(() => {
                onUpdate(currentNode, false);
            }, false);

            return {
                dom,
                update: (updatedNode) => {
                    if (!updatedNode.sameMarkup(currentNode)) return false;
                    currentNode = updatedNode;
                    onUpdate(currentNode, false);

                    return true;
                },
                selectNode: () => {
                    onFocus(currentNode);
                },
                deselectNode: () => {
                    onBlur(currentNode);
                },
                stopEvent,
                ignoreMutation: () => true,
                destroy() {
                    onDestroy();
                },
            };
        },
        inputRules: (nodeType) => [
            new InputRule(inputRegex, (state, _match, start, end) => {
                const $start = state.doc.resolve(start);
                if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), nodeType)) return null;
                const tr = state.tr.delete(start, end).setBlockType(start, start, nodeType, { id: getId() });

                return tr.setSelection(NodeSelection.create(tr.doc, start - 1));
            }),
        ],
        remarkPlugins: () => [remarkLatex],
    };
});

export const latex = AtomList.create([latexNode()]);
