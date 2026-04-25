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

# ai-figure — Complete Syntax Quick-Start Guide

Generates self-contained SVG diagrams. No coordinates needed — layout is computed automatically.

```typescript
import { fig } from 'ai-figure';

// Markdown string (preferred — compact, streaming-safe)
const svg = fig(`
  figure flow
  direction: LR
  palette: antv
  title: CI Pipeline
  code: Write Code
  test: Tests Pass?, decision
  build: Build Image
  fix: Fix Issues, terminal
  deploy: Deploy, io
  code --> test
  test --> build: yes
  test --> fix: no
  fix --> code
  group Pipeline: code, test, build
`);

// JSON config object (programmatic / strongly-typed)
const svg2 = fig({ figure: 'flow', nodes: [...], edges: [...] });

// DOM: document.getElementById('chart').innerHTML = svg;
// Node.js: fs.writeFileSync('chart.svg', svg);
```

`fig()` accepts either a **markdown string** or a **JSON config**. When given a string it never throws — partial or empty input (e.g. during AI streaming) returns a valid empty SVG that fills in progressively.

---

## Markdown syntax reference

### Structure rules

Every markdown diagram follows four rules:

1. **First non-comment line must be** `figure <type>` (e.g. `figure flow`)
2. **Config lines** come next — `key: value` pairs (see universal config below)
3. **Data lines** are diagram-specific (nodes, edges, sections, etc.)
4. Lines starting with `%%` are **comments** — ignored by the parser

```
figure flow          ← header (required, must be first)
title: My Flow       ← config
direction: LR        ← config
%% this is a comment ← ignored
A: Source            ← data (node declaration)
A --> B: step        ← data (edge)
```

### Universal config keys

These keys work in **all** diagram types:

| Key | Values | Default | Description |
|-----|--------|---------|-------------|
| `title` | any string | — | Centered title above the diagram |
| `subtitle` | any string | — | Centered subtitle below the title |
| `theme` | `light` · `dark` | `light` | Background and text color mode |
| `palette` | see below | `default` | Color palette for nodes |
| `direction` | `TB` · `LR` | `TB` | Layout direction (top-to-bottom or left-to-right) |

**`palette` values:** `default` · `antv` · `drawio` · `figma` · `vega` · `mono-blue` · `mono-green` · `mono-purple` · `mono-orange` · or a 4-element hex array `['#e64980','#ae3ec9','#7048e8','#1098ad']`

> ⚠️ **Reserved config keys** — do not use `title`, `subtitle`, `theme`, `palette`, or `direction` as node IDs; they are consumed by the config parser.

---

## Node declaration (flow / tree / arch / swimlane / state)

Five diagrams share the same node declaration syntax. All shapes use the same `id: label [, type]` format — no bracket or symbol sugar:

| Syntax | Shape | Use |
|--------|-------|-----|
| `id: label` | Rectangle | Default step / process |
| `id: label, decision` | Diamond | Conditional / branch |
| `id: label, terminal` | Pill | Start / End node |
| `id: label, io` | Parallelogram | Input / Output |
| `id` | Rectangle | Process; id is used as label |

**Node IDs** should be short ASCII identifiers (letters, digits, underscores). Avoid spaces and reserved config keys.

Nodes are implicitly created when referenced in an edge (`A --> B`) — you only need a standalone declaration to set a label or type different from the ID:

```
%% inline: node id is used as label (type = process)
A --> B

%% explicit: give a label and/or type
A: Source Node
B: Is Valid?, decision
A --> B
```

---

## Per-diagram syntax

### flow — Flowchart

```
figure flow
direction: LR
palette: antv
title: Auth Flow
%% node declarations
start: Start, terminal
login: Enter Credentials
validate: Valid?, decision
ok: Success, terminal
err: Show Error
%% edges
start --> login
login --> validate
validate --> ok: yes
validate --> err: no
err --> login
%% optional logical group (dashed border, label above)
group Auth: login, validate
```

**Rules:**
- `id: label [, type]` — standalone node declaration (any order relative to edges)
- `A --> B` — directed edge
- `A --> B: label` — labeled edge (colon separates target id from edge label)
- `group Label: id1, id2, …` — group nodes visually; label is the group title

---

### tree — Tree / Hierarchy

```
figure tree
direction: TB
title: Org Chart
%% node declarations (optional; id = label if omitted)
ceo: CEO
cto: CTO
eng1: Alice
eng2: Bob
%% parent → child edges define the hierarchy
ceo --> cto
cto --> eng1
cto --> eng2
```

**Rules:**
- Same node declaration syntax as flow
- Edges define parent → child relationships; cycles are not supported
- Root nodes (no incoming edges) are placed at the top (TB) or left (LR)

---

### arch — Architecture Diagram

```
figure arch
direction: TB
palette: figma
title: Web Stack
layer Frontend
  ui: React App
  cdn: CDN
layer Backend
  api: REST API
  auth: Auth Service
layer Data
  db: PostgreSQL
  cache: Redis
```

**Rules:**
- `layer Label` — declares a new layer; label serves as both id and display name
- `id: label` — node within the current layer (indentation is optional but recommended)
- No edges — arch is a layered grid, not a graph
- `direction: TB` stacks layers top-to-bottom; `LR` places them left-to-right

---

### sequence — Sequence Diagram

```
figure sequence
title: Login Flow
actors: Browser, API, DB    %% optional; inferred from messages if omitted
Browser -> API: POST /login  %% solid arrow (request)
API -> DB: SELECT user       %% solid arrow
DB --> API: user row         %% dashed arrow (response / return)
API --> Browser: 200 OK      %% dashed arrow
```

**Rules:**
- `actors: A, B, C` — explicit actor order (inferred from message order if omitted)
- `A -> B: label` — solid arrow (request / call)
- `A --> B: label` — dashed arrow (response / return); label is optional on both
- Actor names can contain spaces; they are used verbatim as both id and display name

---

### quadrant — Quadrant Chart

```
figure quadrant
title: Feature Priority
x-axis Effort: Low .. High
y-axis Value: Low .. High
quadrant-1: Quick Wins       %% top-left
quadrant-2: Major Projects   %% top-right
quadrant-3: Fill-ins         %% bottom-left
quadrant-4: Thankless Tasks  %% bottom-right
%% data points: Label: x, y  (x/y in [0,1]; 0=min, 1=max)
Feature A: 0.2, 0.85
Feature B: 0.75, 0.80
Feature C: 0.5, 0.6
```

**Rules:**
- `x-axis Label: min .. max` or `x-axis: min .. max` (label optional)
- `y-axis Label: min .. max` (same)
- `quadrant-1` = top-left, `quadrant-2` = top-right, `quadrant-3` = bottom-left, `quadrant-4` = bottom-right
- Data points: `Label: x, y` where x/y are decimals in `[0, 1]`
- Points are auto-colored by which quadrant they fall in

---

### gantt — Gantt Chart

```
figure gantt
title: Q1 Roadmap
section Design
  Wireframes: t1, 2025-01-06, 2025-01-24
  Mockups: t2, 2025-01-25, 2025-02-07
section Development
  Frontend: t3, 2025-02-03, 2025-02-28
  Backend: t4, 2025-01-20, 2025-03-07
milestone: Design Freeze, 2025-02-07
milestone: Launch, 2025-03-28
```

**Rules:**
- `section Label` — groups subsequent tasks under a bold header
- Task: `Label: id, yyyy-mm-dd, yyyy-mm-dd` — label (display), id (unique), start, end
  - **id is required** even if not referenced elsewhere
  - `end` date must be ≥ `start` date
- `milestone: Label, yyyy-mm-dd` — vertical diamond marker on the time axis

---

### state — State Machine

```
figure state
title: Order Status
%% state declarations
idle: Idle
processing: Processing
shipped: Shipped
failed: Failed
accent: failed             %% highlight as focal/error state (max 1–2)
%% transitions
start --> idle             %% start = reserved pseudo-state (filled circle ●)
idle --> processing: place order
processing --> shipped: confirmed
processing --> failed: error
failed --> idle: retry
shipped --> end            %% end = reserved pseudo-state (ringed circle ◎)
```

**Rules:**
- `id: label` — normal state (rounded rectangle)
- `start` and `end` are **reserved** pseudo-state ids; do not use them as regular state ids
- `id --> id2` or `id --> id2: event` — transition with optional event label
- `accent: id` — marks a state with the accent color (typically the error/focal state)
- State declarations are optional: unreferenced ids are auto-created with id as label

---

### er — Entity-Relationship Diagram

```
figure er
title: Blog Schema
entity User
  id pk: uuid
  email: text
  name: text
entity Post
  id pk: uuid
  author_id fk: uuid
  title: text
  body: text
entity Comment
  id pk: uuid
  post_id fk: uuid
User --> Post: writes
Post --> Comment: has
accent: User               %% mark aggregate root
```

**Rules:**
- `entity Name` — declares an entity box; Name is used as both id and display label
- Fields inside an entity (indentation optional):
  - `name pk: type` — primary key field
  - `name fk: type` — foreign key field
  - `name: type` — regular typed field
  - `name` — bare field (no type)
- `A --> B: label` — relationship line (label optional); appears after entity blocks
- `accent: EntityName` — marks the aggregate root entity (max 1)
- Config lines (`title`, `theme`, etc.) must come **before** the first `entity` line

---

### timeline — Timeline

```
figure timeline
title: Product History
2020-01-15: v1.0 Launch milestone
2021-06-01: v1.5 Improvements
2022-03-10: v2.0 Redesign milestone
2023-11-01: v3.0 AI Features
2024-06-15: v4.0 Performance milestone
```

**Rules:**
- Lines: `yyyy-mm-dd: label` — regular event (small dot)
- Lines: `yyyy-mm-dd: label milestone` — major milestone (larger accent-color dot); append the literal word `milestone` after the label
- Events are auto-sorted by date and spaced proportionally on a horizontal axis
- Labels alternate above/below the baseline to reduce collision

---

### swimlane — Swimlane Flow

```
figure swimlane
title: Order Processing
section Customer
  order: Place Order
  pay: Confirm Payment
section Warehouse
  receive: Receive Order
  pack: Pack Items, decision
section Shipping
  ship: Ship Package, io
%% edges (can cross lanes)
order --> pay
pay --> receive
receive --> pack
pack --> ship: dispatched
```

**Rules:**
- `section LaneName` — declares a lane; all following node lines belong to it
- Node declarations inside a lane: `id: label [, type]` (same as flow)
- `A --> B` or `A --> B: label` — directed edges; cross-lane edges use S-curve routing
- Lanes appear in declaration order (top-to-bottom in the SVG)

---

### bubble — Bubble Chart

```
figure bubble
title: Market Analysis
palette: vega
Product A: 75
Product B: 50
Product C: 85
Product D: 30
Product E: 110
```

**Rules:**
- Data lines: `Label: value` where value is a **positive number**
- Bubble **area** is proportional to value (not radius)
- Positions are computed automatically by a circle-packing algorithm
- Bubbles cycle through palette colors by index and pulse with SMIL animation

---

## Syntax cheat sheet

```
%% ── Universal structure ──────────────────────────────────────
figure <type>              %% required first line
title: My Diagram          %% optional title
subtitle: Details          %% optional subtitle
theme: dark                %% light (default) | dark
palette: antv              %% see palette list
direction: LR              %% TB (default) | LR
%% ── Node declaration (flow / tree / arch / swimlane / state) ─
id                         %% process; id = label
id: label                  %% process (rectangle)
id: label, decision        %% decision (diamond)
id: label, terminal        %% terminal (pill)
id: label, io              %% io (parallelogram)
%% ── Edges ───────────────────────────────────────────────────
A --> B                    %% directed edge (flow / tree / state / er / swimlane)
A --> B: label             %% labeled edge
A -> B: label              %% solid arrow (sequence only)
A --> B: response          %% dashed return arrow (sequence only)
%% ── Grouping / sections ──────────────────────────────────────
group Name: id1, id2       %% logical group in flow
section Name               %% layer in gantt / lane in swimlane
layer Name                 %% layer in arch
entity Name                %% entity in er
%% ── Special per-type ─────────────────────────────────────────
accent: id                 %% highlight state/entity (state / er)
milestone: Label, date     %% gantt milestone
yyyy-mm-dd: label milestone %% timeline major event
```

---

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
