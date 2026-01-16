import { state, addTodo, toggleTodo, deleteTodo, getRemainingCount } from './state';
import { setupDelegation, batch } from '@dominator/core';
// @ts-ignore
import { render } from './generated/todo-render';

const root = document.getElementById('app')!;
setupDelegation(root);

const update = () => {
    batch(() => {
        const todoListHtml = state.todos.map(todo => `
      <li class="${todo.done ? 'done' : ''}">
        <span onclick="window.toggle(${todo.id})">${todo.text}</span>
        <button onclick="window.remove(${todo.id})">x</button>
      </li>
    `).join('');

        const viewState = {
            todoItems: todoListHtml, // Note: my simple compiler might treat this as text. 
            // I'll need to adjust the compiler or the ways I use it.
            remainingCount: getRemainingCount()
        };

        // For a real AOT compiler, we would generate code that patches efficiently.
        // Here we'll just re-render into the root for the demo if the compiler is simple.
        const newDom = render(viewState, {
            addTodo: () => {
                const input = document.getElementById('todo-input') as HTMLInputElement;
                addTodo(input.value);
                input.value = '';
                update();
            }
        });

        root.innerHTML = '';
        root.appendChild(newDom);
    });
};

// Expose actions to window for the simple event delegation in the template-generated HTML strings
(window as any).toggle = (id: number) => {
    toggleTodo(id);
    update();
};
(window as any).remove = (id: number) => {
    deleteTodo(id);
    update();
};

update();
