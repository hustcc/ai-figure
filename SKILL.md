---
name: ai-figure
version: "0.2.0"
description: Generate clean SVG diagrams (flowchart, tree, architecture, sequence) from a JSON config. Auto-layout, zero coordinates needed. Works in browser and Node.js.
author: hustcc
license: MIT
package: ai-figure
api: createFlowChart | createTreeDiagram | createArchDiagram | createSequenceDiagram → string (SVG)
tags: [flowchart, tree-diagram, architecture-diagram, sequence-diagram, svg, layout, visualization]
---

# ai-figure Skill

## What this skill does

Converts a declarative JSON config (nodes + edges + optional groups) into a fully-rendered SVG flowchart string. You never specify coordinates — the layout is computed automatically.

## How to use (for AI agents)

**Step 1 — Build the JSON config** (this is your main task as an AI)

The config has three parts:
- `nodes` — every box in the chart
- `edges` — every arrow between boxes
- `groups` *(optional)* — dashed-border containers around related nodes

**Step 2 — Call the API**

```typescript
import { createFlowChart } from 'ai-figure';

const svg = createFlowChart(config);
// Inject into DOM:
document.getElementById('chart').innerHTML = svg;
// Or write to file (Node.js):
fs.writeFileSync('chart.svg', svg);
```

---

## JSON config reference

### Minimal example

```json
{
  "nodes": [
    { "id": "start",   "label": "Start",   "type": "terminal" },
    { "id": "process", "label": "Process", "type": "process"  },
    { "id": "end",     "label": "End",     "type": "terminal" }
  ],
  "edges": [
    { "from": "start",   "to": "process" },
    { "from": "process", "to": "end"     }
  ]
}
```

### Full example with decision, IO, groups

```json
{
  "nodes": [
    { "id": "req",    "label": "HTTP Request",   "type": "io"       },
    { "id": "auth",   "label": "Authenticate",   "type": "process"  },
    { "id": "check",  "label": "Authorized?",    "type": "decision" },
    { "id": "handle", "label": "Handle Request", "type": "process"  },
    { "id": "resp",   "label": "Send Response",  "type": "io"       },
    { "id": "deny",   "label": "403 Forbidden",  "type": "terminal" }
  ],
  "edges": [
    { "from": "req",    "to": "auth"                   },
    { "from": "auth",   "to": "check"                  },
    { "from": "check",  "to": "handle", "label": "Yes" },
    { "from": "check",  "to": "deny",   "label": "No"  },
    { "from": "handle", "to": "resp"                   }
  ],
  "groups": [
    { "id": "g1", "label": "Auth Layer", "nodes": ["auth", "check"] }
  ],
  "theme": "clean",
  "direction": "TB"
}
```

---

## Node types

| `type`     | Shape             | When to use                          |
|------------|-------------------|--------------------------------------|
| `process`  | Rectangle         | Steps, actions, computations         |
| `decision` | Diamond           | Conditions, if/else, yes/no branches |
| `terminal` | Rounded rectangle | Start and End nodes only             |
| `io`       | Parallelogram     | User input, system output, data I/O  |

> Default type is `process` if omitted.

## Edge labels

Add a `"label"` to any edge to annotate the arrow:

```json
{ "from": "decision", "to": "yes_branch", "label": "Yes" }
{ "from": "decision", "to": "no_branch",  "label": "No"  }
```

## Options

| Field       | Type   | Default        | Values                       |
|-------------|--------|----------------|------------------------------|
| `theme`     | string | `"excalidraw"` | `"excalidraw"` or `"clean"`  |
| `direction` | string | `"TB"`         | `"TB"` or `"LR"`             |

- `"excalidraw"` — vibrant pastel fills with matched colored borders
- `"clean"` — minimal white fills, per-type colored borders (blue/orange/green/purple)
- `"TB"` — top-to-bottom layout (tall charts)
- `"LR"` — left-to-right layout (wide pipeline charts)

---

## Rules for generating good configs

1. **Every flowchart must have exactly one start and one end node** — both `type: "terminal"`.
2. **Use `decision` only when a node fans out to 2+ edges** — always label those edges (e.g. `"Yes"` / `"No"`).
3. **Node `id` values must be unique** — use short slugs (`"auth"`, `"parse"`, `"retry"`).
4. **Edges are directed** — `from` → `to` follows the logical flow direction.
5. **Groups are cosmetic only** — they draw a dashed border but do not affect layout.
6. **Choose `direction` based on chart shape** — use `"LR"` for pipelines (3+ sequential steps), `"TB"` for trees and decision branches. When the chart has more than 4 levels of depth, prefer `"TB"` — tall charts look better top-to-bottom than wide.
7. **Keep labels short** — node labels ≤ 20 characters fit without wrapping.

---

## Complete TypeScript types

```typescript
interface FlowChartOptions {
  nodes:      FlowNode[];
  edges:      FlowEdge[];
  groups?:    FlowGroup[];
  theme?:     'excalidraw' | 'clean';   // default: 'excalidraw'
  direction?: 'TB' | 'LR';             // default: 'TB'
}

interface FlowNode  { id: string; label: string; type?: 'process' | 'decision' | 'terminal' | 'io' }
interface FlowEdge  { from: string; to: string; label?: string }
interface FlowGroup { id: string; label: string; nodes: string[] }
```

---

## TreeDiagram

Renders a tree/hierarchy from a flat node list with `parent` references. Reuses Dagre layout internally.

```typescript
import { createTreeDiagram } from 'ai-figure';

const svg = createTreeDiagram({
  nodes: [
    { id: 'ceo',  label: 'CEO' },
    { id: 'cto',  label: 'CTO',  parent: 'ceo' },
    { id: 'coo',  label: 'COO',  parent: 'ceo' },
  ],
  theme: 'clean',      // optional, default: 'excalidraw'
  direction: 'TB',     // optional, default: 'TB'
});
```

```typescript
interface TreeDiagramOptions { nodes: TreeNode[]; theme?: ThemeType; direction?: Direction }
interface TreeNode { id: string; label: string; parent?: string }
```

---

## ArchDiagram

Renders a tech-stack / architecture landscape grid: layers of equal-width cells, no edges.

```typescript
import { createArchDiagram } from 'ai-figure';

const svg = createArchDiagram({
  layers: [
    { id: 'fe', label: 'Frontend', nodes: [{ id: 'react', label: 'React' }, { id: 'vue', label: 'Vue' }] },
    { id: 'be', label: 'Backend',  nodes: [{ id: 'node',  label: 'Node.js' }] },
  ],
  theme: 'excalidraw',  // optional
  direction: 'TB',      // optional — TB = layers top-to-bottom, LR = layers left-to-right
  width: 800,           // optional, default: 800
});
```

```typescript
interface ArchDiagramOptions { layers: ArchLayer[]; theme?: ThemeType; direction?: Direction; width?: number }
interface ArchLayer { id: string; label: string; nodes: ArchNode[] }
interface ArchNode  { id: string; label: string }
```

---

## SequenceDiagram

Renders a sequence diagram with vertical lifelines and horizontal message arrows.

```typescript
import { createSequenceDiagram } from 'ai-figure';

const svg = createSequenceDiagram({
  actors: ['Browser', 'API', 'DB'],
  messages: [
    { from: 'Browser', to: 'API', label: 'POST /login' },
    { from: 'API',     to: 'DB',  label: 'SELECT user' },
    { from: 'DB',      to: 'API', label: 'user row',   style: 'return' },
    { from: 'API',     to: 'Browser', label: '200 OK', style: 'return' },
  ],
  theme: 'excalidraw',  // optional
});
```

```typescript
interface SequenceDiagramOptions { actors: string[]; messages: SeqMessage[]; theme?: ThemeType }
interface SeqMessage { from: string; to: string; label?: string; style?: 'solid' | 'return' }
```
