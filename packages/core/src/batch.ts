const queue: Array<() => void> = [];
let pending = false;

const flush = () => {
    while (queue.length > 0) {
        queue.shift()!();
    }
    pending = false;
};

export const batch = (fn: () => void) => {
    queue.push(fn);
    if (!pending) {
        pending = true;
        queueMicrotask(flush);
    }
};
