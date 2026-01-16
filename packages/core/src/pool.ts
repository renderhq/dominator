export class Pool<T> {
    private pool: T[] = [];
    constructor(private factory: () => T, private reset: (obj: T) => void) { }

    get(): T {
        const obj = this.pool.pop() || this.factory();
        return obj;
    }

    release(obj: T): void {
        this.reset(obj);
        if (this.pool.length < 1000) {
            this.pool.push(obj);
        }
    }
}

import { VNode } from './vnode';

export const vnodePool = new Pool<VNode>(
    () => ({ tag: null, props: null, children: null, key: null, el: null }),
    (v) => {
        v.tag = null;
        v.props = null;
        v.children = null;
        v.key = null;
        v.el = null;
    }
);
