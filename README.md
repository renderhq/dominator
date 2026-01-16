# Dominator

Dominator is a reactive UI library that compiles JSX into a Static Single Assignment (SSA) instruction set for direct DOM manipulation. It eliminates the Virtual DOM by transforming declarative templates into a linear pipeline of imperative updates.

## Core Concepts

### SSA Instruction Pipeline
The compiler (`packages/core/src/compiler`) parses JSX and generates a flat sequence of instructions (e.g., `create`, `attr`, `event`, `append`). Each operation is assigned a unique identifier, allowing the runtime to perform targeted updates without tree reconciliation.

### Fine-grained Reactivity
State is managed via signals. When a signal is used within a JSX expression, the compiler creates a subscription that links the signal directly to the specific DOM instruction responsible for that node or attribute.

### Microtask Batching
All DOM updates are batched using a microtask queue (`packages/core/src/batch.ts`). This ensures that multiple signal updates in the same execution cycle result in a single DOM commit.

## Workspace Management

This project is organized as a pnpm workspace.

### Core Package
The core runtime and compiler logic.
- Location: `packages/core`
- Build: `pnpm --filter @dominator/core run build`

### Examples
Demonstration of the runtime in action.
- Location: `packages/todo-example`
- Dev: `pnpm dev` (Runs the todo example)

## API Reference

### signal
Reactive state primitive.
```typescript
const count = signal(0);
count.get();              // Read
count.set(1);             // Write
count.update(n => n + 1); // Update
```

### h
JSX factory for instruction generation.
```tsx
const View = () => (
  <div>
    <h1>{count}</h1>
    <button onClick={() => count.update(n => n + 1)}>Increment</button>
  </div>
);
```

### mount
Attaches the compiled instruction stream to a DOM element.
```typescript
mount(<View />, document.getElementById('root')!);
```

## Development Commands

Install dependencies:
```bash
pnpm install
```

Start the development server for the todo-example:
```bash
pnpm dev
```

Build all packages:
```bash
pnpm build
```
