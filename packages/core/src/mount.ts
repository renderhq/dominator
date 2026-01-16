import { VNode } from './vnode';
import { addEventListener } from './events';

export const mount = (vnode: VNode | string): Node => {
    if (typeof vnode === 'string') {
        return document.createTextNode(vnode);
    }

    const el = document.createElement(vnode.tag!);
    vnode.el = el;

    if (vnode.props) {
        for (const key in vnode.props) {
            if (key.startsWith('on')) {
                addEventListener(el, key.slice(2).toLowerCase(), vnode.props[key]);
            } else {
                (el as any)[key] = vnode.props[key];
            }
        }
    }

    if (vnode.children) {
        for (const child of vnode.children) {
            el.appendChild(mount(child));
        }
    }

    return el;
};
