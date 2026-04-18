---
name: ai-figure
version: "0.1.0"
description: Generate clean SVG diagrams (flowchart, tree, architecture, sequence, quadrant) from a JSON config via a single fig() API. Auto-layout, zero coordinates needed. Works in browser and Node.js.
author: hustcc
license: MIT
package: ai-figure
api: fig(options) → string (SVG)
tags: [flowchart, tree-diagram, architecture-diagram, sequence-diagram, quadrant-chart, svg, layout, visualization]
---

# ai-figure Skill

## What this skill does

Converts a declarative JSON config into a fully-rendered SVG diagram string. You never specify coordinates — the layout is computed automatically.

A single `fig()` function handles all diagram types. Select the type via the required `figure` field.

## How to use (for AI agents)

**Step 1 — Pick a diagram type and build the JSON config**

| `figure` value | Diagram type       | Key fields              |
|----------------|--------------------|-------------------------|
| `'flow'`       | Flowchart          | `nodes`, `edges`, `groups?` |
| `'tree'`       | Tree / hierarchy   | `nodes` (with `parent` refs) |
| `'arch'`       | Architecture grid  | `layers`                |
| `'sequence'`   | Sequence diagram   | `actors`, `messages`    |
| `'quadrant'`   | Quadrant chart     | `xAxis`, `yAxis`, `quadrants`, `points` |

**Step 2 — Call the API**

```typescript
import { fig } from 'ai-figure';

const svg = fig(config);
// Inject into DOM:
document.getElementById('chart').innerHTML = svg;
// Or write to file (Node.js):
fs.writeFileSync('chart.svg', svg);
```

---

## figure: 'flow' — Flowchart

### Minimal example

```json
{
  "figure": "flow",
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
  "figure": "flow",
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

### Node types

| `type`     | Shape             | When to use                          |
|------------|-------------------|--------------------------------------|
| `process`  | Rectangle         | Steps, actions, computations         |
| `decision` | Diamond           | Conditions, if/else, yes/no branches |
| `terminal` | Rounded rectangle | Start and End nodes only             |
| `io`       | Parallelogram     | User input, system output, data I/O  |

> Default type is `process` if omitted.

### Options

| Field       | Type   | Default        | Values                       |
|-------------|--------|----------------|------------------------------|
| `theme`     | string | `"excalidraw"` | `"excalidraw"` or `"clean"`  |
| `direction` | string | `"TB"`         | `"TB"` or `"LR"`             |

### Rules for generating good flowchart configs

1. **Every flowchart must have exactly one start and one end node** — both `type: "terminal"`.
2. **Use `decision` only when a node fans out to 2+ edges** — always label those edges (e.g. `"Yes"` / `"No"`).
3. **Node `id` values must be unique** — use short slugs (`"auth"`, `"parse"`, `"retry"`).
4. **Edges are directed** — `from` → `to` follows the logical flow direction.
5. **Groups are cosmetic only** — they draw a dashed border but do not affect layout.
6. **Choose `direction` based on chart shape** — use `"LR"` for pipelines, `"TB"` for trees and branches.
7. **Keep labels short** — node labels ≤ 20 characters fit without wrapping.

### TypeScript types

```typescript
interface FlowChartOptions {
  nodes:      FlowNode[];
  edges:      FlowEdge[];
  groups?:    FlowGroup[];
  theme?:     'excalidraw' | 'clean';
  direction?: 'TB' | 'LR';
}
interface FlowNode  { id: string; label: string; type?: 'process' | 'decision' | 'terminal' | 'io' }
interface FlowEdge  { from: string; to: string; label?: string }
interface FlowGroup { id: string; label: string; nodes: string[] }
```

---

## figure: 'tree' — Tree Diagram

Renders a hierarchy from a flat node list with `parent` references. Nodes are colored by depth level.

```json
{
  "figure": "tree",
  "nodes": [
    { "id": "ceo", "label": "CEO" },
    { "id": "cto", "label": "CTO", "parent": "ceo" },
    { "id": "coo", "label": "COO", "parent": "ceo" },
    { "id": "fe",  "label": "FE Lead", "parent": "cto" }
  ],
  "theme": "clean",
  "direction": "TB"
}
```

### TypeScript types

```typescript
interface TreeDiagramOptions { nodes: TreeNode[]; theme?: ThemeType; direction?: Direction }
interface TreeNode { id: string; label: string; parent?: string }
```

---

## figure: 'arch' — Architecture Diagram

Renders a tech-stack / architecture landscape grid: color-coded layer cards, no edges.

```json
{
  "figure": "arch",
  "layers": [
    { "id": "fe", "label": "Frontend", "nodes": [{ "id": "react", "label": "React" }, { "id": "vue", "label": "Vue" }] },
    { "id": "be", "label": "Backend",  "nodes": [{ "id": "node",  "label": "Node.js" }] }
  ],
  "theme": "excalidraw",
  "direction": "TB",
  "width": 800
}
```

### TypeScript types

```typescript
interface ArchDiagramOptions { layers: ArchLayer[]; theme?: ThemeType; direction?: Direction; width?: number }
interface ArchLayer { id: string; label: string; nodes: ArchNode[] }
interface ArchNode  { id: string; label: string }
```

---

## figure: 'sequence' — Sequence Diagram

Renders a sequence diagram with vertical lifelines (animated) and horizontal message arrows.

```json
{
  "figure": "sequence",
  "actors": ["Browser", "API", "DB"],
  "messages": [
    { "from": "Browser", "to": "API", "label": "POST /login" },
    { "from": "API",     "to": "DB",  "label": "SELECT user" },
    { "from": "DB",      "to": "API", "label": "user row",   "style": "return" },
    { "from": "API",     "to": "Browser", "label": "200 OK", "style": "return" }
  ],
  "theme": "excalidraw"
}
```

Use `"style": "return"` for dashed response arrows; omit or use `"style": "solid"` for solid request arrows.

### TypeScript types

```typescript
interface SequenceDiagramOptions { actors: string[]; messages: SeqMessage[]; theme?: ThemeType }
interface SeqMessage { from: string; to: string; label?: string; style?: 'solid' | 'return' }
```

---

## figure: 'quadrant' — Quadrant Chart

Renders a 2×2 matrix with two labelled axes and data points positioned by normalised `x`/`y` coordinates (0–1). The canvas auto-sizes based on the number of points: it starts at 640×640, grows by 24px per point beyond the first four, and is capped at 1024×1024 — no need to specify width or height. Each quadrant has a distinct background tint; data points are solid-filled and automatically colored by the quadrant they fall into.

```json
{
  "figure": "quadrant",
  "xAxis": { "label": "实现难度", "min": "低", "max": "高" },
  "yAxis": { "label": "业务价值", "min": "低", "max": "高" },
  "quadrants": ["立即做", "计划做", "搁置", "外包"],
  "points": [
    { "id": "a", "label": "登录优化",  "x": 0.2, "y": 0.9 },
    { "id": "b", "label": "推荐系统",  "x": 0.8, "y": 0.8 },
    { "id": "c", "label": "暗黑模式",  "x": 0.3, "y": 0.2 }
  ],
  "theme": "excalidraw"
}
```

`quadrants` order: **[top-left, top-right, bottom-left, bottom-right]**.  
Point coordinates: `x=0` is left, `x=1` is right; `y=0` is bottom, `y=1` is top.  
Points are auto-colored by their quadrant (top-left=green, top-right=orange, bottom-left=purple, bottom-right=blue for excalidraw theme).

### TypeScript types

```typescript
interface QuadrantChartOptions {
  xAxis:     { label: string; min: string; max: string };
  yAxis:     { label: string; min: string; max: string };
  quadrants: [string, string, string, string];
  points:    QuadrantPoint[];
  theme?:    'excalidraw' | 'clean';
}
interface QuadrantPoint { id: string; label: string; x: number; y: number }
```

