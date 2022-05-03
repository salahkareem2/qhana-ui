import { css, injectGlobal } from '@emotion/css';
import { ThemeBorder, ThemeColor, themeFactory, ThemeFont, ThemeGlobal, ThemeIcon, ThemeScrollbar, ThemeShadow, ThemeSize } from '@milkdown/core';
import { injectProsemirrorView, useAllPresetRenderer } from '@milkdown/theme-pack-helper';


interface IconMapping {
    [prop: string]: {
        label: string,
        icon: string,
    }
}

const iconMapping: IconMapping = {
    help: {
        label: 'help',
        icon: 'help',
    },
    diagram: {
        label: 'diagram',
        icon: 'account_tree',
    },
    h1: {
        label: 'h1',
        icon: 'looks_one',
    },
    h2: {
        label: 'h2',
        icon: 'looks_two',
    },
    h3: {
        label: 'h3',
        icon: 'looks_3',
    },
    loading: {
        label: 'loading',
        icon: 'hourglass_empty',
    },
    quote: {
        label: 'quote',
        icon: 'format_quote',
    },
    code: {
        label: 'code',
        icon: 'code',
    },
    table: {
        label: 'table',
        icon: 'table_chart',
    },
    divider: {
        label: 'divider',
        icon: 'horizontal_rule',
    },
    image: {
        label: 'image',
        icon: 'image',
    },
    brokenImage: {
        label: 'broken image',
        icon: 'broken_image',
    },
    bulletList: {
        label: 'bullet list',
        icon: 'format_list_bulleted',
    },
    orderedList: {
        label: 'ordered list',
        icon: 'format_list_numbered',
    },
    taskList: {
        label: 'task list',
        icon: 'checklist',
    },
    bold: {
        label: 'bold',
        icon: 'format_bold',
    },
    italic: {
        label: 'italic',
        icon: 'format_italic',
    },
    inlineCode: {
        label: 'inline code',
        icon: 'code',
    },
    strikeThrough: {
        label: 'strike through',
        icon: 'strikethrough_s',
    },
    link: {
        label: 'link',
        icon: 'link',
    },
    leftArrow: {
        label: 'left arrow',
        icon: 'chevron_left',
    },
    rightArrow: {
        label: 'right arrow',
        icon: 'chevron_right',
    },
    upArrow: {
        label: 'up arrow',
        icon: 'expand_less',
    },
    downArrow: {
        label: 'down arrow',
        icon: 'expand_more',
    },
    alignLeft: {
        label: 'align left',
        icon: 'format_align_left',
    },
    alignRight: {
        label: 'align right',
        icon: 'format_align_right',
    },
    alignCenter: {
        label: 'align center',
        icon: 'format_align_center',
    },
    delete: {
        label: 'delete',
        icon: 'delete',
    },
    select: {
        label: 'select',
        icon: 'select_all',
    },
    unchecked: {
        label: 'unchecked',
        icon: 'check_box_outline_blank',
    },
    checked: {
        label: 'checked',
        icon: 'check_box',
    },
    undo: {
        label: 'undo',
        icon: 'turn_left',
    },
    redo: {
        label: 'redo',
        icon: 'turn_right',
    },
    liftList: {
        label: 'lift list',
        icon: 'format_indent_decrease',
    },
    sinkList: {
        label: 'sink list',
        icon: 'format_indent_increase',
    },
};

const colorMap = {
    "primary": "--primary",
    "secondary": "--primary",
    "neutral": "--text",
    "solid": "--text",
    "shadow": "--background",
    "line": "--text-washed",
    "border": "--border-color",
    "surface": "--background-card",
    "background": "--background",
}

export const QhanaTheme = themeFactory((emotion, manager) => {
    const documentStyles = (document.querySelector("body") as any)?.computedStyleMap();
    manager.set(ThemeColor, ([key, opacity]) => {
        let cssVar = colorMap[key] ?? "--text";
        let color: string = documentStyles.get(cssVar).toString().trim();
        if (color === "white") {
            color = "#ffffff";
        }
        if (color === "black") {
            color = "#000000";
        }
        if (color.startsWith("#")) {
            color = color.substring(1);
        }
        let rgb: number[] | null = null;
        let defaultOpacity = 1;
        if (color.startsWith("rgba")) {
            const values = color.substring(5, color.length - 1).split(/\s*,\s*/);
            defaultOpacity = parseFloat(values.pop() ?? "1");
            rgb = values.map((value => parseInt(value, 10)));
        } else if (color.startsWith("rgb")) {
            const values = color.substring(4, color.length - 1).split(/\s*,\s*/);
            rgb = values.map((value => parseInt(value, 10)));
        } else {
            const splitColor: string[] = []
            if (color.length === 3) {
                splitColor.push(color.charAt(0) + color.charAt(0));
                splitColor.push(color.charAt(1) + color.charAt(1));
                splitColor.push(color.charAt(2) + color.charAt(2));
            }
            if (color.length === 6) {
                splitColor.push(color.substring(0, 2))
                splitColor.push(color.substring(2, 4))
                splitColor.push(color.substring(4, 6))
            }
            rgb = splitColor.map((value) => parseInt(value, 16))
        }
        if (!rgb || rgb.length !== 3) {
            return;
        }

        return `rgba(${rgb?.join(', ')}, ${(opacity || 1) * defaultOpacity})`;
    });
    manager.set(ThemeSize, (key) => {
        if (key === 'radius') return '4px';

        return '1px';
    });
    manager.set(ThemeIcon, (iconId) => {
        const target = iconMapping[iconId] ?? null;
        const span = document.createElement('span');
        span.className = 'icon material-icons material-icons-outlined';
        span.textContent = target?.icon ?? iconId;

        return {
            dom: span,
            label: target?.label ?? iconId,
        };
    });

    manager.set(ThemeScrollbar, ([direction = 'y', type = 'normal'] = ['y', 'normal'] as never) => {
        const main = manager.get(ThemeColor, [('border' as any), 0.38]);
        const bg = manager.get(ThemeColor, [('border' as any), 0.12]);
        const hover = manager.get(ThemeColor, [('border' as any)]);
        return css`
            scrollbar-width: thin;
            scrollbar-color: ${main} ${bg};
            -webkit-overflow-scrolling: touch;
            &::-webkit-scrollbar {
                ${direction === 'y' ? 'width' : 'height'}: ${type === 'thin' ? 2 : 12}px;
                background-color: transparent;
            }
            &::-webkit-scrollbar-track {
                border-radius: 999px;
                background: transparent;
                border: 4px solid transparent;
            }
            &::-webkit-scrollbar-thumb {
                border-radius: 999px;
                background-color: ${main};
                border: ${type === 'thin' ? 0 : 4}px solid transparent;
                background-clip: content-box;
            }
            &::-webkit-scrollbar-thumb:hover {
                background-color: ${hover};
            }
        `;
    });

    manager.set(ThemeFont, (key) => {
        if (key === 'typography') return 'Roboto, arial, sans-serif';

        return 'monospace';
    });

    manager.set(ThemeShadow, (key) => {
        const width = manager.get(ThemeSize, 'lineWidth');

        return `box-shadow: 0 ${width} ${width} rgba(0,0,0,0.14), 0 2px ${width} rgba(0,0,0,0.12), 0 ${width} 3px rgba(0,0,0,0.2)};`;
    });

    manager.set(ThemeBorder, (direction) => {
        const line = manager.get(ThemeColor, [('border' as any)]);
        const width = manager.get(ThemeSize, 'lineWidth');
        if (!direction) {
            return `border: ${width} solid var(--border-color);`;
        }
        return `${`border-${direction}`}: ${width} solid var(--border-color);`;
    });

    manager.set(ThemeGlobal, () => {
        const background = manager.get(ThemeColor, ['background', 0.5]);
        const secondary = manager.get(ThemeColor, ['secondary']);
        const table = css`
            /* copy from https://github.com/ProseMirror/prosemirror-tables/blob/master/style/tables.css */
            .tableWrapper {
                overflow-x: auto;
                margin: 0;
                ${manager.get(ThemeScrollbar, ['x'])}
                width: 100%;
                * {
                    margin: 0;
                    box-sizing: border-box;
                    font-size: 1em;
                }
            }
            table {
                border-collapse: collapse;
                table-layout: fixed;
                width: 100%;
                overflow: auto;
                border-radius: ${manager.get(ThemeSize, 'radius')};
                p {
                    line-height: unset;
                }
            }
            tr {
                ${manager.get(ThemeBorder, 'bottom')};
            }
            td,
            th {
                padding: 0 1em;
                vertical-align: top;
                box-sizing: border-box;
                position: relative;
                min-width: 100px;
                ${manager.get(ThemeBorder, undefined)};
                text-align: left;
                line-height: 3;
                height: 3em;
            }
            th {
                background-color: ${background};
                font-weight: 400;
            }
            .column-resize-handle {
                position: absolute;
                right: -2px;
                top: 0;
                bottom: 0;
                z-index: 20;
                pointer-events: none;
                background-color: ${secondary};
                width: ${manager.get(ThemeSize, 'lineWidth')};
            }
            .resize-cursor {
                cursor: ew-resize;
                cursor: col-resize;
            }
            .selectedCell {
                &::after {
                    z-index: 2;
                    position: absolute;
                    content: '';
                    left: 0;
                    right: 0;
                    top: 0;
                    bottom: 0;
                    background-color: ${secondary};
                    opacity: 0.5;
                    pointer-events: none;
                }
                & ::selection {
                    color: unset;
                    background: transparent;
                }
            }
        `;

        injectProsemirrorView(emotion);

        injectGlobal`
            .milkdown {
                .material-icons-outlined {
                    font-size: 1.5em;
                }
                position: relative;
                margin-left: auto;
                margin-right: auto;
                box-sizing: border-box;
                ${manager.get(ThemeShadow, undefined)}
                ${manager.get(ThemeScrollbar, undefined)}
                .editor {
                    outline: none;
                    ${table};
                }
            }
        `;
    });

    useAllPresetRenderer(manager, emotion);
});

