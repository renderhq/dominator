import { VNode } from './vnode';
import { mount } from './mount';
import { addEventListener } from './events';

export const patch = (el: Node, oldVNode: VNode | string | null, newVNode: VNode | string | null) => {
    if (oldVNode === newVNode) return;

    if (newVNode === null) {
        el.parentElement?.removeChild(el);
        return;
    }

    if (oldVNode === null || typeof oldVNode === 'string' || typeof newVNode === 'string') {
        if (oldVNode !== newVNode) {
            const newEl = mount(newVNode);
            el.parentElement?.replaceChild(newEl, el);
        }
        return;
    }

    if (oldVNode.tag !== newVNode.tag) {
        const newEl = mount(newVNode);
        el.parentElement?.replaceChild(newEl, el);
        return;
    }

    const domEl = el as HTMLElement;
    newVNode.el = domEl;

    // Patch props
    const oldProps = oldVNode.props || {};
    const newProps = newVNode.props || {};

    for (const key in newProps) {
        if (newProps[key] !== oldProps[key]) {
            if (key.startsWith('on')) {
                addEventListener(domEl, key.slice(2).toLowerCase(), newProps[key]);
            } else {
                (domEl as any)[key] = newProps[key];
            }
        }
    }

    for (const key in oldProps) {
        if (!(key in newProps)) {
            if (!key.startsWith('on')) {
                (domEl as any)[key] = null;
            }
        }
    }

    // Patch children (simple diff)
    patchChildren(domEl, oldVNode.children || [], newVNode.children || []);
};

function patchChildren(el: HTMLElement, oldCh: (VNode | string)[], newCh: (VNode | string)[]) {
    const commonLen = Math.min(oldCh.length, newCh.length);

    for (let i = 0; i < commonLen; i++) {
        patch(el.childNodes[i], oldCh[i], newCh[i]);
    }

    if (newCh.length > oldCh.length) {
        for (let i = commonLen; i < newCh.length; i++) {
            el.appendChild(mount(newCh[i]));
        }
    } else if (oldCh.length > newCh.length) {
        for (let i = oldCh.length - 1; i >= commonLen; i--) {
            el.removeChild(el.childNodes[i]);
        }
    }
}
