import { effect } from '@dominator/core';
import * as stateModule from '../state';

export const renderRalph = () => {
  const state = stateModule as any;
  const events = (window as any);

  // Dynamic injection of state into local scope
  const { currentColor, tool, pixels, history, redoStack, GRID_SIZE, colorCounts, undo, redo, exportToPNG, startDrawing, ifDrawing, stopDrawing, PARTICLE_COUNT, getParticles, frame, mouse } = state;
  const v1 = document.createElement('div');
  v1.setAttribute('class', "ralph-container");
  const v2 = document.createElement('div');
  v2.setAttribute('class', "hud");
  const v3 = document.createElement('h1');
  const v4 = document.createTextNode("Dominator Render Pipeline");
  v3.appendChild(v4);
  v2.appendChild(v3);
  const v5 = document.createElement('div');
  v5.setAttribute('class', "meta");
  const v6 = document.createElement('div');
  v6.setAttribute('class', "entry");
  const v7 = document.createElement('label');
  const v8 = document.createTextNode("Active Nodes");
  v7.appendChild(v8);
  v6.appendChild(v7);
  const v9 = document.createElement('span');
  const v10 = document.createTextNode('');
  effect(() => { v10.textContent = String(NODE_COUNT); });
  v9.appendChild(v10);
  v6.appendChild(v9);
  v5.appendChild(v6);
  const v11 = document.createElement('div');
  v11.setAttribute('class', "entry");
  const v12 = document.createElement('label');
  const v13 = document.createTextNode("Engine");
  v12.appendChild(v13);
  v11.appendChild(v12);
  const v14 = document.createElement('span');
  const v15 = document.createTextNode("SSA Instruction set");
  v14.appendChild(v15);
  v11.appendChild(v14);
  v5.appendChild(v11);
  v2.appendChild(v5);
  v1.appendChild(v2);
  const v16 = document.createElement('div');
  v16.setAttribute('class', "viewport");
  const v17 = document.createDocumentFragment();
  effect(() => {
      v17.textContent = ''; 
      (getNodes() || []).forEach((n) => {
  const v18 = document.createElement('div');
  v18.setAttribute('class', "node");
  effect(() => { v18.style.left = n.x() + 'px'; });
  effect(() => { v18.style.top = n.y() + 'px'; });
  effect(() => { v18.style.backgroundColor = n.color(); });
        v17.appendChild(v18);
      });
  });
  v16.appendChild(v17);
  v1.appendChild(v16);
  return v1;
};