---
name: ai-flowchart
version: "0.1.0"
description: Generate clean SVG flowcharts from a JSON config. Excalidraw-inspired style, auto-layout via dagre, zero coordinates needed. Works in browser and Node.js.
author: hustcc
license: MIT
package: ai-flowchart
api: createFlowChart(options) → string (SVG)
tags: [flowchart, svg, diagram, layout, visualization]
---

# ai-flowchart Skill

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
import { createFlowChart } from 'ai-flowchart';

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
6. **Choose `direction` based on chart shape** — use `"LR"` for pipelines (3+ sequential steps), `"TB"` for trees and decision branches.
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
