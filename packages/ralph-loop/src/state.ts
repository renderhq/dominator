import { signal } from '@dominator/core';

export const NODE_COUNT = 2000; // Optimized for consistent 60FPS
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

interface Node {
    id: number;
    x: number; // Use raw numbers for physics
    y: number;
    vx: number;
    vy: number;
    // Single signal for the entire transform to minimize effect overhead
    transform: ReturnType<typeof signal<string>>;
    color: string; // Static color is faster
}

export const nodes = signal<Node[]>([]);
export const mouse = { x: WIDTH / 2, y: HEIGHT / 2 };
export const fps = signal(0);

const init = () => {
    const list: Node[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
        const x = Math.random() * WIDTH;
        const y = Math.random() * HEIGHT;
        list.push({
            id: i,
            x,
            y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            transform: signal(`translate3d(${x | 0}px, ${y | 0}px, 0)`),
            color: `hsl(${Math.random() * 360}, 70%, 50%)`
        });
    }
    nodes.set(list);
};

init();

let lastTime = performance.now();
let frames = 0;

const loop = () => {
    const now = performance.now();
    frames++;

    if (now > lastTime + 1000) {
        fps.set(Math.round((frames * 1000) / (now - lastTime)));
        lastTime = now;
        frames = 0;
    }

    const currentNodes = nodes();
    const mx = mouse.x;
    const my = mouse.y;
    const len = currentNodes.length;

    // Batch process physics
    for (let i = 0; i < len; i++) {
        const n = currentNodes[i];

        // Simple attraction
        const dx = mx - n.x;
        const dy = my - n.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < 160000) { // 400^2
            const dist = Math.sqrt(distSq);
            const force = (400 - dist) / 5000;
            n.vx += dx * force;
            n.vy += dy * force;
        }

        n.vx *= 0.95;
        n.vy *= 0.95;
        n.x += n.vx;
        n.y += n.vy;

        // Wrap
        if (n.x < 0) n.x = WIDTH;
        else if (n.x > WIDTH) n.x = 0;
        if (n.y < 0) n.y = HEIGHT;
        else if (n.y > HEIGHT) n.y = 0;

        // Only commit to signal once per frame with translate3d
        // GPU accelerated movement
        // Bitwise truncate for speed
        n.transform.set(`translate3d(${n.x | 0}px, ${n.y | 0}px, 0)`);
    }

    requestAnimationFrame(loop);
};

loop();

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

export const getNodes = () => nodes();
