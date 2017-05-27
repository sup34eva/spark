import React from 'react';
import Remarkable from 'remarkable';
import { shell } from 'electron';

const md = new Remarkable({
    linkify: true,
});

md.core.ruler.enable([
    'block',
    'inline',
    'linkify',
], true);
md.block.ruler.enable([
    'paragraph',
], true);
md.inline.ruler.enable([
    'del',
    'emphasis',
    'text',
], true);

function render(head, tail) {
    let result = [];
    for (let i = 0; i < tail.length; i++) {
        const { type, content } = tail[i];
        if (type === 'inline') {
            result = result.concat(
                render(null, tail[i].children)[0],
            );
        } else if (type.endsWith('_open')) {
            const [res, j] = render(tail[i], tail.slice(i + 1));
            result = result.concat(res);
            i = i + 1 + j;
        } else if (type.endsWith('_close')) {
            const tag = type.substr(0, type.length - 6);
            if (tag === 'link') {
                const elem = React.createElement('a', {
                    href: head.href,
                    onClick: evt => {
                        evt.preventDefault();
                        shell.openExternal(head.href);
                    },
                }, ...result);

                return [[elem], i];
            }

            const elem = React.createElement(tag === 'paragraph' ? 'p' : tag, {}, ...result);
            return [[elem], i];
        } else {
            result.push(content);
        }
    }

    return [result, tail.length];
}

md.renderer = {
    ...md.renderer,
    renderInline(tokens) {
        return render(null, tokens)[0];
    },

    render(tokens) {
        return render(null, tokens)[0];
    },
};

export default md;
