const eventListeners = new WeakMap<Node, Record<string, Function>>();

export const setupDelegation = (root: Node) => {
    const handler = (e: Event) => {
        let target = e.target as Node | null;
        while (target && target !== root) {
            const listeners = eventListeners.get(target);
            if (listeners && listeners[e.type]) {
                listeners[e.type](e);
                if (e.cancelBubble) break;
            }
            target = target.parentNode;
        }
    };

    ['click', 'input', 'change', 'submit', 'keydown'].forEach((type) => {
        root.addEventListener(type, handler);
    });
};

export const addEventListener = (el: Node, type: string, fn: Function) => {
    let listeners = eventListeners.get(el);
    if (!listeners) {
        listeners = {};
        eventListeners.set(el, listeners);
    }
    listeners[type] = fn;
};
