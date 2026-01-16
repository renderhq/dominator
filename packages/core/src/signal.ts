type Subscriber = () => void;
let activeEffect: Subscriber | null = null;

export interface Signal<T> {
    (): T;
    get(): T;
    set(value: T): void;
    update(fn: (prev: T) => T): void;
    subscribe(fn: Subscriber): () => void;
}

export const signal = <T>(initialValue: T): Signal<T> => {
    let value = initialValue;
    const subscribers = new Set<Subscriber>();

    const s = (() => {
        if (activeEffect) {
            subscribers.add(activeEffect);
        }
        return value;
    }) as Signal<T>;

    s.get = () => s();

    s.set = (newValue: T) => {
        if (value !== newValue) {
            value = newValue;
            subscribers.forEach(sub => sub());
        }
    };

    s.update = (fn: (prev: T) => T) => {
        s.set(fn(value));
    };

    s.subscribe = (fn: Subscriber) => {
        subscribers.add(fn);
        return () => subscribers.delete(fn);
    };

    return s;
};

export const computed = <T>(fn: () => T): () => T => {
    const s = signal<T>(undefined as any);
    effect(() => {
        s.set(fn());
    });
    return s;
};

export const effect = (fn: Subscriber) => {
    const run = () => {
        activeEffect = run;
        try {
            fn();
        } finally {
            activeEffect = null;
        }
    };
    run();
};
