import { renderCanvas } from './generated/canvas-render.ts';
import './style.css';

const root = document.getElementById('root')!;

// Mount the compiled canvas
// renderCanvas() returns a DOM element with fine-grained subscriptions
if (root) {
    root.appendChild(renderCanvas());
}
