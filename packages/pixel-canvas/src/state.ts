import { signal, computed } from '@dominator/core';

export const GRID_SIZE = 64;
type Color = string; // e.g. '#ff0000'

interface Pixel {
    x: number;
    y: number;
    color: Color;
}

export const pixels = signal<Record<string, Color>>({}); // key: `${x}-${y}`
export const currentColor = signal<Color>('#000000');
export const tool = signal<'draw' | 'erase'>('draw');
export const history = signal<Pixel[]>([]); // simple undo stack
export const redoStack = signal<Pixel[]>([]);

export const setPixel = (x: number, y: number) => {
    const key = `${x}-${y}`;
    const p = pixels();
    const prevColor = p[key] || '#ffffff';

    if (tool() === 'erase') {
        if (prevColor !== '#ffffff') {
            pixels.update(p => { const next = { ...p }; delete next[key]; return next; });
            history.update(h => [...h, { x, y, color: prevColor }]);
        }
    } else {
        const color = currentColor();
        if (p[key] === color) return;
        pixels.update(p => ({ ...p, [key]: color }));
        history.update(h => [...h, { x, y, color: prevColor }]);
    }
    redoStack.set([]); // clear redo on new action
};

export const undo = () => {
    const hist = history();
    if (!hist.length) return;
    const last = hist[hist.length - 1];
    const key = `${last.x}-${last.y}`;
    pixels.update(p => {
        const next = { ...p };
        if (last.color === '#ffffff') delete next[key];
        else next[key] = last.color;
        return next;
    });
    history.update(h => h.slice(0, -1));
    redoStack.update(r => [...r, last]);
};

export const redo = () => {
    const r = redoStack();
    if (!r.length) return;
    const next = r[r.length - 1];
    setPixel(next.x, next.y); // re-apply
    redoStack.update(rr => rr.slice(0, -1));
};

// Derived: color usage stats
export const colorCounts = computed(() => {
    const count: Record<Color, number> = {};
    Object.values(pixels()).forEach(c => { count[c] = (count[c] || 0) + 1; });
    return Object.entries(count).sort((a, b) => b[1] - a[1]);
});

// Simulate "other user" drawing (for demo)
setInterval(() => {
    if (Math.random() > 0.9) { // Reduced frequency for sanity
        const x = Math.floor(Math.random() * GRID_SIZE);
        const y = Math.floor(Math.random() * GRID_SIZE);
        setPixel(x, y);
    }
}, 1000);

let isDrawing = false;
let lastX = -1, lastY = -1;

export const startDrawing = (e: MouseEvent) => {
    isDrawing = true;
    drawAt(e);
};

export const ifDrawing = (e: MouseEvent) => {
    if (!isDrawing) return;
    drawAt(e);
};

export const stopDrawing = () => {
    isDrawing = false;
    lastX = -1;
    lastY = -1;
};

function drawAt(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.classList.contains('pixel')) return;

    const x = Number(target.dataset.x);
    const y = Number(target.dataset.y);

    if (x !== lastX || y !== lastY) {
        setPixel(x, y);
        lastX = x;
        lastY = y;
    }
}

export const exportToPNG = () => {
    const canvas = document.createElement('canvas');
    canvas.width = GRID_SIZE;
    canvas.height = GRID_SIZE;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);

    const p = pixels();
    for (const key in p) {
        const [x, y] = key.split('-').map(Number);
        ctx.fillStyle = p[key];
        ctx.fillRect(x, y, 1, 1);
    }

    const link = document.createElement('a');
    link.download = 'pixel-art.png';
    link.href = canvas.toDataURL();
    link.click();
};
