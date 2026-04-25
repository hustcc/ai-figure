---
name: ai-figure
version: "0.2.0"
description: Generate clean SVG diagrams (flowchart, tree, architecture, sequence, quadrant, gantt, state machine, ER, timeline, swimlane, bubble chart) from a markdown string or a JSON config via fig(). Auto-layout, zero coordinates needed. Works in browser and Node.js.
author: hustcc
license: MIT
package: ai-figure
api: fig(markdown|options) → string (SVG)
tags: [flowchart, tree-diagram, architecture-diagram, sequence-diagram, quadrant-chart, gantt-chart, state-machine, er-diagram, timeline, swimlane, bubble-chart, svg, layout, visualization, markdown]
---

# ai-figure Skill

Generates self-contained SVG diagrams. No coordinates needed — layout is computed automatically.

```typescript
import { fig } from 'ai-figure';

// Markdown string (preferred — compact, streaming-safe)
const svg = fig(`
  figure flow
  direction: LR
  palette: antv
  title: CI Pipeline
  code[Write Code] --> test{Tests Pass?}
  test --> build[Build Image]: yes
  test --> fix((Fix Issues)): no
  fix --> code
  build --> deploy[/Deploy/]
  group Pipeline: code, test, build
`);

// JSON config object (programmatic / strongly-typed)
const svg2 = fig({ figure: 'flow', nodes: [...], edges: [...] });

// DOM: document.getElementById('chart').innerHTML = svg;
// Node.js: fs.writeFileSync('chart.svg', svg);
```

`fig()` accepts either a **markdown string** or a **JSON config**. When given a string it never throws — partial or empty input (e.g. during AI streaming) returns a valid empty SVG that fills in progressively.

## Markdown syntax

**First line must be:** `figure <type>`

Config lines use `key: value` syntax. Data lines use diagram-specific patterns.

| Key | Values | Default |
|-----|--------|---------|
| `type` | `flow` `tree` `arch` `sequence` `quadrant` `gantt` `state` `er` `timeline` `swimlane` `bubble` | required |
| `direction` | `TB` `LR` | `TB` |
| `theme` | `light` `dark` | `light` |
| `palette` | `default` `antv` `drawio` `figma` `vega` `mono-blue` `mono-green` `mono-purple` `mono-orange` | `default` |

Lines starting with `%%` are comments. `title:` and `subtitle:` work in all types.

### Node notation (flow / tree / arch / swimlane)

These bracket suffixes are **syntax sugar** — a compact way to declare a node's visual shape inline, without a separate node definition line.

| Notation | Shape |
|----------|-------|
| `id[label]` | process (rectangle) |
| `id{label}` | decision (diamond) |
| `id((label))` | terminal (pill) |
| `id[/label/]` | io (parallelogram) |
| `id` | process, id used as label |

### flow

```
figure flow
direction: LR
palette: antv
title: My Flow
A[Source] --> B[Target]          %% simple edge
A --> B[Target]: label           %% labeled edge
group Name: id1, id2, id3        %% logical group (dashed border)
```

### tree

```
figure tree
direction: LR
title: Org Chart
root[Root]
root --> child[Child]
child --> leaf[Leaf]
```

### arch

```
figure arch
direction: TB
palette: antv
title: Web Stack
layer Frontend
  ui[React App]
  assets[Static Assets]
layer Backend
  api[REST API]
  auth[Auth Service]
layer Data
  db[PostgreSQL]
```

### sequence

```
figure sequence
title: Login
actors: Browser, API, DB         %% optional; inferred from messages if omitted
Browser -> API: POST /login      %% solid arrow
API --> Browser: 200 OK          %% dashed return arrow
```

### quadrant

```
figure quadrant
title: Priority
x-axis Effort: Low .. High
y-axis Value: Low .. High
quadrant-1: Quick Wins    %% top-left
quadrant-2: Strategic     %% top-right
quadrant-3: Low Prio      %% bottom-left
quadrant-4: Long Shots    %% bottom-right
Feature A: 0.2, 0.9       %% label: x, y  (x/y in [0,1])
```

### gantt

```
figure gantt
title: Q1 Roadmap
section Design
  Wireframes: t1, 2025-01-06, 2025-01-24    %% label: id, start, end
  Mockups: t2, 2025-01-25, 2025-02-07
section Dev
  Frontend: t3, 2025-02-03, 2025-02-28
milestone: Launch, 2025-03-01
```

- Task format: `<label>: <id>, <yyyy-mm-dd>, <yyyy-mm-dd>` — **id is required**, even if you don't reference it
- `end` ≥ `start`; `section` groups tasks under a bold header; `milestone: <label>, <date>` marks a point in time

### state

```
figure state
title: Order Status
idle[Idle]
processing[Processing]
accent: failed                   %% mark as accent/focal state
start --> idle                   %% start pseudo-state
idle --> processing: order placed
processing --> end: shipped
processing --> failed: error
failed --> idle: retry
```

- `id[label]` — normal state (rounded rectangle)
- `start` / `end` — reserved pseudo-state ids (filled circle / ringed circle)
- `id --> id2: event` — transition with optional label
- `accent: id` — mark a state as the focal/error state (max 1–2)

### er

```
figure er
title: Blog Schema
entity User
  id pk: uuid
  email: text
entity Post
  id pk: uuid
  author_id fk: uuid
  title: text
User --> Post: writes
```

- `entity Name` — declare an entity box (name used as id and label)
- Fields: `name pk: type` (primary key), `name fk: type` (foreign key), `name: type`, or bare `name`
- `A --> B: label` — relationship line with optional label
- `accent: EntityName` to mark the aggregate root entity

### timeline

```
figure timeline
title: Product History
2020-01-15: v1.0 Launch milestone   %% major milestone (larger accent dot)
2021-06-01: v1.5 Improvements
2022-03-10: v2.0 Redesign milestone
2023-11-01: v3.0 AI Features
```

- Lines: `yyyy-mm-dd: label` or `yyyy-mm-dd: label milestone`
- Events are sorted chronologically and spaced proportionally on a horizontal axis
- Labels alternate above and below the baseline to reduce collision

### swimlane

```
figure swimlane
title: Order Flow
section Customer
  order[Place Order]
  pay[Confirm Payment]
section Warehouse
  receive[Receive Order]
  pack[Pack Items]
section Shipping
  ship[Ship Package]
order --> pay
pay --> receive
receive --> pack
pack --> ship
```

- `section LaneName` — declares a new lane; subsequent node lines belong to it
- `id[Node Label]` — node declaration inside the current lane
- `A --> B` or `A --> B: label` — directed edges (may cross lanes)

### bubble

```
figure bubble
title: Market Analysis
%% label: value (positive number)
Product A: 75
Product B: 50
Product C: 85
```

- Data lines: `Label: value` — any positive number; bubble **area is proportional to value**
- Positions computed automatically by a circle-packing algorithm — no coordinates needed
- Bubbles cycle through `process`/`decision`/`terminal`/`io` palette colors by index
- Each bubble pulses with a staggered SMIL animation (breathing effect)

## JSON config (fig(options))

Same result as markdown but typed. Use when building diagrams programmatically.

```typescript
interface FlowChartOptions {
  figure: 'flow';
  nodes: FlowNode[];        // { id, label, type?: 'process'|'decision'|'terminal'|'io' }
  edges: FlowEdge[];        // { from, to, label? }
  groups?: FlowGroup[];     // { id, label, nodes: string[] }
  direction?: 'TB'|'LR'; title?: string; subtitle?: string;
  theme?: 'light'|'dark'; palette?: string|string[];
}

interface TreeDiagramOptions {
  figure: 'tree';
  nodes: TreeNode[];        // { id, label, parent? }
  direction?: 'TB'|'LR'; title?: string; subtitle?: string;
  theme?: 'light'|'dark'; palette?: string|string[];
}

interface ArchDiagramOptions {
  figure: 'arch';
  layers: ArchLayer[];      // { id, label, nodes: { id, label }[] }
  direction?: 'TB'|'LR'; title?: string; subtitle?: string;
  theme?: 'light'|'dark'; palette?: string|string[];
}

interface SequenceDiagramOptions {
  figure: 'sequence';
  actors: string[];
  messages: SeqMessage[];   // { from, to, label?, style?: 'solid'|'return' }
  title?: string; subtitle?: string;
  theme?: 'light'|'dark'; palette?: string|string[];
}

interface QuadrantChartOptions {
  figure: 'quadrant';
  xAxis: { label: string; min: string; max: string };
  yAxis: { label: string; min: string; max: string };
  quadrants: [string, string, string, string]; // [TL, TR, BL, BR]
  points: QuadrantPoint[];  // { id, label, x, y }  x/y in [0,1]
  title?: string; subtitle?: string;
  theme?: 'light'|'dark'; palette?: string|string[];
}

interface GanttChartOptions {
  figure: 'gantt';
  tasks: GanttTask[];       // { id, label, start, end, groupId?, color? }
  milestones?: GanttMilestone[]; // { date, label }
  title?: string; subtitle?: string;
  theme?: 'light'|'dark'; palette?: string|string[];
}

interface StateDiagramOptions {
  figure: 'state';
  nodes: StateNode[];       // { id, label, type?: 'state'|'start'|'end', accent?: boolean }
  transitions: StateTransition[]; // { from, to, label? }
  title?: string; subtitle?: string;
  theme?: 'light'|'dark'; palette?: string|string[];
}

interface ErDiagramOptions {
  figure: 'er';
  entities: ErEntity[];     // { id, label, fields: ErField[], accent?: boolean }
  relations: ErRelation[];  // { from, to, label?, fromCard?, toCard? }
  title?: string; subtitle?: string;
  theme?: 'light'|'dark'; palette?: string|string[];
}
// ErField: { name, type?, key?: 'pk'|'fk' }

interface TimelineDiagramOptions {
  figure: 'timeline';
  events: TimelineEvent[];  // { id, label, date, milestone? }  date: 'yyyy-mm-dd'
  title?: string; subtitle?: string;
  theme?: 'light'|'dark'; palette?: string|string[];
}

interface SwimlaneDiagramOptions {
  figure: 'swimlane';
  lanes: string[];          // lane labels in display order
  nodes: SwimlaneNode[];    // { id, label, lane, type? }  lane = one of lanes[]
  edges: SwimlaneEdge[];    // { from, to, label? }
  title?: string; subtitle?: string;
  theme?: 'light'|'dark'; palette?: string|string[];
}

interface BubbleChartOptions {
  figure: 'bubble';
  items: BubbleItem[];      // { label, value }  — value is a positive number
  title?: string; subtitle?: string;
  theme?: 'light'|'dark'; palette?: string|string[];
}
// BubbleItem: { id?, label, value }  — bubble area is proportional to value; positions auto-packed
```

**quadrants order:** `[top-left, top-right, bottom-left, bottom-right]` · `x=0` left, `x=1` right; `y=0` bottom, `y=1` top.
