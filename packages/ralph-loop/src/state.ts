import { signal } from '@dominator/core';

export const NODE_COUNT = 1000;
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

interface Node {
    id: number;
    x: ReturnType<typeof signal<number>>;
    y: ReturnType<typeof signal<number>>;
    color: ReturnType<typeof signal<string>>;
}

export const nodes = signal<Node[]>([]);

const init = () => {
    const list: Node[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
        list.push({
            id: i,
            x: signal(Math.random() * WIDTH),
            y: signal(Math.random() * HEIGHT),
            color: signal(`hsl(${Math.random() * 360}, 70%, 50%)`)
        });
    }
    nodes.set(list);
};

init();

let tick = 0;
const loop = () => {
    tick++;
    const currentNodes = nodes();

    // Low-level batch update simulation
    for (let i = 0; i < currentNodes.length; i++) {
        const n = currentNodes[i];
        // Sine wave movement
        const offsetX = Math.sin((tick + i) * 0.05) * 2;
        const offsetY = Math.cos((tick + i) * 0.05) * 2;

        n.x.set(n.x() + offsetX);
        n.y.set(n.y() + offsetY);

        // Color shift every 10 frames
        if (tick % 10 === 0) {
            n.color.set(`hsl(${(tick + (i * 0.5)) % 360}, 70%, 50%)`);
        }
    }

    requestAnimationFrame(loop);
};

loop();

export const getNodes = () => nodes();
