# Dominator

Dominator is a high-performance reactive UI engine that compiles declarative templates into a Static Single Assignment (SSA) instruction set. By bypassing the Virtual DOM and utilizing a linear pipeline of imperative updates, Dominator achieves near-native performance with zero reconciliation overhead.

## Technical Architecture

### SSA Instruction Pipeline
The compiler (`packages/core/src/compiler`) transforms JSX directly into a flat sequence of atomic DOM instructions such as `create`, `attr`, and `append`. Each operation is assigned a unique identifier, allowing the runtime to perform targeted updates without tree reconciliation.

### Fine-grained Reactivity
State is managed via optimized signals. When a signal is accessed within a template, the compiler creates a direct link between the signal and the specific DOM attribute or text node, ensuring updates are scoped to the exact point of change.

### Microtask Batching
DOM updates are batched using a prioritized microtask queue. This ensures that multiple state changes in a single execution cycle result in a single, coordinated DOM commit, eliminating redundant layout shifts.

## Project Structure

- **Core** (`packages/core`): The fundamental reactive engine, SSA compiler, and signal system.
- **Pixel Canvas** (`packages/pixel-canvas`): A high-stress demonstration of fine-grained reactivity featuring a 4,096-node grid, real-time collaboration simulation, and artifact export.
- **Todo Example** (`packages/todo-example`): A foundational implementation demonstrating standard state management.

## Showcases

### Pixel Canvas
The Pixel Canvas serves as the primary benchmark for Dominator's performance. It features:
- **SSA-Optimized Grid**: Direct manipulation of thousands of individual pixel nodes.
- **State Management**: Undo/Redo history, live palette usage statistics, and color tracking.
- **Premium Interface**: A minimal, engineering-focused UI built with Inter and Geist Mono, utilizing glassmorphism and monochrome design tokens.

## Development

### Installation
```bash
pnpm install
```

### Compiling Templates
Dominator uses a custom `.dnr` format for its high-performance templates. To compile a template to executable TypeScript:
```bash
pnpm run compile -- [input.dnr] [output.ts]
```

### Running Locally
To launch the Pixel Canvas development server:
```bash
pnpm --filter @dominator/pixel-canvas dev
```

## Comparisons

Unlike traditional Virtual DOM libraries that rely on tree diffing ($O(n)$ where $n$ is the number of nodes), Dominator's SSA approach allows for $O(1)$ updates by targeting pre-computed instruction offsets. This results in significantly lower memory overhead and higher frame stability in complex applications.

---

Built by the 
