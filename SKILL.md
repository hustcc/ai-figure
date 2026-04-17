# SKILL: ai-flowchart

Generate Excalidraw-style SVG flowcharts from a simple node/edge description.

## Install

```bash
npm install ai-flowchart
```

## Usage

```typescript
import { createFlowChart } from 'ai-flowchart';

const svg = createFlowChart({
  nodes: [
    { id: 'start',    label: 'Start',      type: 'terminal' },
    { id: 'process',  label: 'Process',    type: 'process'  },
    { id: 'decision', label: 'Is Valid?',  type: 'decision' },
    { id: 'yes',      label: 'Success',    type: 'terminal' },
    { id: 'no',       label: 'Failure',    type: 'terminal' },
  ],
  edges: [
    { from: 'start',    to: 'process'                },
    { from: 'process',  to: 'decision'               },
    { from: 'decision', to: 'yes', label: 'Yes'     },
    { from: 'decision', to: 'no',  label: 'No'      },
  ],
  theme: 'excalidraw', // 'excalidraw' | 'clean'
  direction: 'TB',     // 'TB' (top→bottom) | 'LR' (left→right)
});

// svg is a string — inject into DOM or write to a file
document.getElementById('chart').innerHTML = svg;
```

## API

### `createFlowChart(options): string`

Returns an SVG string. Layout is computed automatically — no coordinates needed.

#### Node types (`type` field)

| Value      | Shape             | Use for                |
|------------|-------------------|------------------------|
| `process`  | Rectangle         | Steps / actions        |
| `decision` | Diamond           | Conditions / branches  |
| `terminal` | Rounded rectangle | Start / End nodes      |
| `io`       | Parallelogram     | Input / Output         |

#### Options

| Field       | Type          | Default        | Description                       |
|-------------|---------------|----------------|-----------------------------------|
| `nodes`     | `FlowNode[]`  | required       | List of nodes                     |
| `edges`     | `FlowEdge[]`  | required       | Directed edges between nodes      |
| `groups`    | `FlowGroup[]` | `[]`           | Optional groups with dashed borders |
| `theme`     | string        | `'excalidraw'` | `'excalidraw'` or `'clean'`       |
| `direction` | string        | `'TB'`         | `'TB'` or `'LR'`                  |

#### FlowNode

```typescript
{ id: string; label: string; type?: 'process' | 'decision' | 'terminal' | 'io' }
```

#### FlowEdge

```typescript
{ from: string; to: string; label?: string }
```

#### FlowGroup

```typescript
{ id: string; label: string; nodes: string[] }
```

## Tips for AI

- Use `type: 'terminal'` for the first and last nodes.
- Use `type: 'decision'` for any branching node (if/else, yes/no).
- Use `type: 'io'` for nodes that represent user input or system output.
- Edge labels like `'Yes'` / `'No'` or `'✓'` / `'✗'` are shown inline on the arrow.
- Wrap related nodes in a `group` to visually cluster them.
- Use `direction: 'LR'` for wide horizontal flows; `'TB'` for tall vertical flows.
