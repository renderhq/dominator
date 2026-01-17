import { signal } from './signal.ts';

export const path = signal(window.location.pathname);

window.addEventListener('popstate', () => {
    path.set(window.location.pathname);
});

export const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    path.set(to);
};

export interface Route {
    path: string;
    component: () => HTMLElement;
}

export const createRouter = (routes: Route[]) => {
    const root = document.createElement('div');
    root.className = 'dominator-router';

    let currentElement: HTMLElement | null = null;

    path.subscribe(() => {
        const currentPath = path.get();
        const route = routes.find(r => r.path === currentPath) || routes.find(r => r.path === '*');

        if (route) {
            const nextElement = route.component();
            if (currentElement) {
                root.replaceChild(nextElement, currentElement);
            } else {
                root.appendChild(nextElement);
            }
            currentElement = nextElement;
        }
    });

    // Initial render
    const initialPath = path.get();
    const initialRoute = routes.find(r => r.path === initialPath) || routes.find(r => r.path === '*');
    if (initialRoute) {
        currentElement = initialRoute.component();
        root.appendChild(currentElement);
    }

    return root;
};
