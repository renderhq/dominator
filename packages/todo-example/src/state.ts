export interface Todo {
    id: number;
    text: string;
    done: boolean;
}

export interface State {
    todos: Todo[];
    inputValue: string;
}

export const state: State = {
    todos: [],
    inputValue: ''
};

export const addTodo = (text: string) => {
    if (!text.trim()) return;
    state.todos.push({
        id: Date.now(),
        text,
        done: false
    });
};

export const toggleTodo = (id: number) => {
    const todo = state.todos.find(t => t.id === id);
    if (todo) todo.done = !todo.done;
};

export const deleteTodo = (id: number) => {
    state.todos = state.todos.filter(t => t.id !== id);
};

export const getRemainingCount = () => state.todos.filter(t => !t.done).length;
