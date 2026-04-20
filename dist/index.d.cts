/**
 * Node type in the flowchart.
 * - process: default rectangle
 * - decision: diamond shape (for conditionals)
 * - terminal: rounded rectangle (start / end)
 * - io: parallelogram (input / output)
 */
type NodeType = 'process' | 'decision' | 'terminal' | 'io';
/** Layout direction of the graph. */
type Direction = 'TB' | 'LR';
/** Light or dark rendering mode. */
type ThemeType = 'light' | 'dark';
/**
 * Color palette — one of:
 * - `'default'` — built-in multi-hue palette: process=blue, decision=amber, terminal=green, io=purple
 * - `'antv'` — AntV G2 categorical palette (cornflower-blue, orange, teal, violet)
 * - `'drawio'` — draw.io / diagrams.net shape palette (sky-blue, amber, sage, red)
 * - `'figma'` — Figma / design-tool palette (indigo process, cyan decision, emerald terminal, rose io)
 * - `'vega'` — Vega / Vega-Lite categorical palette (steel-blue process, orange decision, teal terminal, crimson io)
 * - `'mono-blue'` — four shades of blue; all node types share the blue hue family
 * - `'mono-green'` — four shades of green; all node types share the green hue family
 * - `'mono-purple'` — four shades of purple; all node types share the purple hue family
 * - `'mono-orange'` — four shades of orange; all node types share the orange hue family
 * - Custom 4-element hex array `[process, decision, terminal, io]`
 */
type PaletteType = string | string[];
/** A single node in the flowchart. */
interface FlowNode {
    /** Unique identifier. */
    id: string;
    /** Text displayed inside the node. */
    label: string;
    /** Visual shape of the node (default: 'process'). */
    type?: NodeType;
}
/** A directed edge connecting two nodes. */
interface FlowEdge {
    /** ID of the source node. */
    from: string;
    /** ID of the target node. */
    to: string;
    /** Optional label displayed along the edge. */
    label?: string;
}
/** A logical group of nodes rendered with a dashed border. */
interface FlowGroup {
    /** Unique identifier. */
    id: string;
    /** Label displayed above the group border. */
    label: string;
    /** IDs of nodes belonging to this group. */
    nodes: string[];
}
/** Options passed to {@link createFlowChart}. */
interface FlowChartOptions {
    /** List of nodes to render. */
    nodes: FlowNode[];
    /** List of directed edges. */
    edges: FlowEdge[];
    /** Optional logical groups. */
    groups?: FlowGroup[];
    /** Light or dark rendering mode (default: 'light'). */
    theme?: ThemeType;
    /** Color palette — `'default'`, `'antv'`, `'drawio'`, `'figma'`, `'vega'`, `'mono-blue'`, `'mono-green'`, `'mono-purple'`, `'mono-orange'`, or custom hex array (default: `'default'`). */
    palette?: PaletteType;
    /** Graph layout direction (default: 'TB' — top to bottom). */
    direction?: Direction;
    /** Optional chart title displayed above the diagram. */
    title?: string;
    /** Optional subtitle displayed beneath the title. */
    subtitle?: string;
}
/** A node in a tree diagram (flat array with parent reference). */
interface TreeNode {
    /** Unique identifier. */
    id: string;
    /** Text displayed inside the node. */
    label: string;
    /** ID of the parent node. Root nodes omit this field. */
    parent?: string;
}
/** Options passed to {@link createTreeDiagram}. */
interface TreeDiagramOptions {
    /** Flat list of nodes with optional parent references. */
    nodes: TreeNode[];
    /** Light or dark rendering mode (default: 'light'). */
    theme?: ThemeType;
    /** Color palette — `'default'`, `'antv'`, `'drawio'`, `'figma'`, `'vega'`, `'mono-blue'`, `'mono-green'`, `'mono-purple'`, `'mono-orange'`, or custom hex array (default: `'default'`). */
    palette?: PaletteType;
    /** Layout direction (default: 'TB'). */
    direction?: Direction;
    /** Optional chart title displayed above the diagram. */
    title?: string;
    /** Optional subtitle displayed beneath the title. */
    subtitle?: string;
}
/** A single node inside an architecture layer. */
interface ArchNode {
    /** Unique identifier. */
    id: string;
    /** Text displayed inside the node. */
    label: string;
}
/** A horizontal layer in an architecture diagram. */
interface ArchLayer {
    /** Unique identifier. */
    id: string;
    /** Label shown at the top of the layer row. */
    label: string;
    /** Nodes displayed inside this layer. */
    nodes: ArchNode[];
}
/** Options passed to {@link createArchDiagram}. */
interface ArchDiagramOptions {
    /** List of layers from top to bottom (TB) or left to right (LR). */
    layers: ArchLayer[];
    /** Light or dark rendering mode (default: 'light'). */
    theme?: ThemeType;
    /** Color palette — `'default'`, `'antv'`, `'drawio'`, `'figma'`, `'vega'`, `'mono-blue'`, `'mono-green'`, `'mono-purple'`, `'mono-orange'`, or custom hex array (default: `'default'`). */
    palette?: PaletteType;
    /** Direction: TB = layers top-to-bottom, LR = layers left-to-right (default: 'TB'). */
    direction?: Direction;
    /** Optional chart title displayed above the diagram. */
    title?: string;
    /** Optional subtitle displayed beneath the title. */
    subtitle?: string;
}
/** A message arrow between two actors in a sequence diagram. */
interface SeqMessage {
    /** Name of the sending actor. */
    from: string;
    /** Name of the receiving actor. */
    to: string;
    /** Optional label shown above the arrow. */
    label?: string;
    /** Arrow style: solid line (default) or dashed return line. */
    style?: 'solid' | 'return';
}
/** Options passed to {@link createSequenceDiagram}. */
interface SequenceDiagramOptions {
    /** Ordered list of participant names. */
    actors: string[];
    /** Ordered list of messages between actors. */
    messages: SeqMessage[];
    /** Light or dark rendering mode (default: 'light'). */
    theme?: ThemeType;
    /** Color palette — `'default'`, `'antv'`, `'drawio'`, `'figma'`, `'vega'`, `'mono-blue'`, `'mono-green'`, `'mono-purple'`, `'mono-orange'`, or custom hex array (default: `'default'`). */
    palette?: PaletteType;
    /** Optional chart title displayed above the diagram. */
    title?: string;
    /** Optional subtitle displayed beneath the title. */
    subtitle?: string;
}
/** A single data point in a quadrant chart. */
interface QuadrantPoint {
    /** Unique identifier. */
    id: string;
    /** Text label displayed next to the point. */
    label: string;
    /** Horizontal position, 0 = left edge, 1 = right edge. */
    x: number;
    /** Vertical position, 0 = bottom, 1 = top (internally flipped for SVG). */
    y: number;
}
/** Options passed to {@link createQuadrantChart}. */
interface QuadrantChartOptions {
    /** X-axis configuration. */
    xAxis: {
        label: string;
        min: string;
        max: string;
    };
    /** Y-axis configuration. */
    yAxis: {
        label: string;
        min: string;
        max: string;
    };
    /** Labels for the four quadrants: [top-left, top-right, bottom-left, bottom-right]. */
    quadrants: [string, string, string, string];
    /** Data points to plot. */
    points: QuadrantPoint[];
    /** Light or dark rendering mode (default: 'light'). */
    theme?: ThemeType;
    /** Color palette — `'default'`, `'antv'`, `'drawio'`, `'figma'`, `'vega'`, `'mono-blue'`, `'mono-green'`, `'mono-purple'`, `'mono-orange'`, or custom hex array (default: `'default'`). */
    palette?: PaletteType;
    /** Optional chart title displayed above the diagram. */
    title?: string;
    /** Optional subtitle displayed beneath the title. */
    subtitle?: string;
}
/** A single task bar in a Gantt chart. */
interface GanttTask {
    /** Unique identifier. */
    id: string;
    /** Task name displayed in the label column and optionally inside the bar. */
    label: string;
    /** Start date in `yyyy-mm-dd` format. */
    start: string;
    /** End date in `yyyy-mm-dd` format. */
    end: string;
    /** Optional group identifier — tasks sharing the same `groupId` are clustered under a group header. */
    groupId?: string;
    /** Optional custom bar color (6-digit hex, e.g. `'#e64980'`). Overrides the theme palette cycle. */
    color?: string;
}
/** A milestone marker displayed on the Gantt timeline. */
interface GanttMilestone {
    /** Milestone date in `yyyy-mm-dd` format. */
    date: string;
    /** Short label displayed near the milestone diamond. */
    label: string;
}
/** Options passed to {@link createGanttChart}. */
interface GanttChartOptions {
    /** List of tasks to render as horizontal bars. */
    tasks: GanttTask[];
    /** Optional milestones to overlay on the timeline. */
    milestones?: GanttMilestone[];
    /** Light or dark rendering mode (default: `'light'`). */
    theme?: ThemeType;
    /** Color palette — `'default'`, `'antv'`, `'drawio'`, `'figma'`, `'vega'`, `'mono-blue'`, `'mono-green'`, `'mono-purple'`, `'mono-orange'`, or custom hex array (default: `'default'`). */
    palette?: PaletteType;
    /** Optional chart title displayed above the diagram. */
    title?: string;
    /** Optional subtitle displayed beneath the title. */
    subtitle?: string;
}
/**
 * Node type in a state machine diagram.
 * - `'state'`  — a normal state (rounded rectangle)
 * - `'start'`  — the initial state (filled circle)
 * - `'end'`    — the terminal / accepting state (ringed circle)
 */
type StateNodeType = 'state' | 'start' | 'end';
/** A single state in a state machine diagram. */
interface StateNode {
    /** Unique identifier. */
    id: string;
    /** Text label displayed inside the state box. */
    label: string;
    /** Visual shape (default: 'state'). */
    type?: StateNodeType;
    /** Highlight this state with the accent color (use for error / happy-path focus; max 1–2). */
    accent?: boolean;
}
/** A transition (arrow) between two states. */
interface StateTransition {
    /** ID of the source state. */
    from: string;
    /** ID of the target state. */
    to: string;
    /** Optional label shown on the arrow — typically `event [guard] / action`. */
    label?: string;
}
/** Options passed to {@link createStateDiagram}. */
interface StateDiagramOptions {
    /** States in the machine. */
    nodes: StateNode[];
    /** Directed transitions between states. */
    transitions: StateTransition[];
    /** Light or dark rendering mode (default: 'light'). */
    theme?: ThemeType;
    /** Color palette (default: `'default'`). */
    palette?: PaletteType;
    /** Optional chart title. */
    title?: string;
    /** Optional subtitle. */
    subtitle?: string;
}
/**
 * Field key designation in an ER entity.
 * - `'pk'` — primary key (prefixed with `#`)
 * - `'fk'` — foreign key (prefixed with `→`)
 */
type ErFieldKey = 'pk' | 'fk';
/** A single field (column) inside an ER entity. */
interface ErField {
    /** Field name. */
    name: string;
    /** Optional data type string (e.g. `'uuid'`, `'text'`, `'int'`). */
    type?: string;
    /** Optional key designation: `'pk'` or `'fk'`. */
    key?: ErFieldKey;
}
/** An entity (table) in an ER diagram. */
interface ErEntity {
    /** Unique identifier. */
    id: string;
    /** Entity display name. */
    label: string;
    /** Ordered list of fields. */
    fields: ErField[];
    /** Highlight this entity with the accent color (use for the aggregate root; max 1). */
    accent?: boolean;
}
/** A relationship line between two entities. */
interface ErRelation {
    /** ID of the source entity. */
    from: string;
    /** ID of the target entity. */
    to: string;
    /** Optional label shown centered on the line (e.g. `'has'`, `'belongs to'`). */
    label?: string;
    /** Cardinality annotation at the `from` end (e.g. `'1'`, `'N'`, `'0..1'`, `'1..*'`). */
    fromCard?: string;
    /** Cardinality annotation at the `to` end. */
    toCard?: string;
}
/** Options passed to {@link createErDiagram}. */
interface ErDiagramOptions {
    /** Entities (tables) in the model. */
    entities: ErEntity[];
    /** Relationships between entities. */
    relations: ErRelation[];
    /** Light or dark rendering mode (default: 'light'). */
    theme?: ThemeType;
    /** Color palette (default: `'default'`). */
    palette?: PaletteType;
    /** Optional chart title. */
    title?: string;
    /** Optional subtitle. */
    subtitle?: string;
}
/** A single event on the timeline. */
interface TimelineEvent {
    /** Unique identifier. */
    id: string;
    /** Short label displayed near the event dot. */
    label: string;
    /** Event date in `yyyy-mm-dd` format (or any parseable date string). */
    date: string;
    /** When true, render as a major milestone (larger, accent-colored dot). */
    milestone?: boolean;
}
/** Options passed to {@link createTimelineDiagram}. */
interface TimelineDiagramOptions {
    /** Ordered or unordered list of events (auto-sorted by date). */
    events: TimelineEvent[];
    /** Light or dark rendering mode (default: 'light'). */
    theme?: ThemeType;
    /** Color palette (default: `'default'`). */
    palette?: PaletteType;
    /** Optional chart title. */
    title?: string;
    /** Optional subtitle. */
    subtitle?: string;
}
/** A single node inside a swimlane. */
interface SwimlaneNode {
    /** Unique identifier. */
    id: string;
    /** Text label. */
    label: string;
    /** ID of the lane this node belongs to. */
    lane: string;
    /** Visual shape (default: 'process'). */
    type?: NodeType;
}
/** A directed edge between swimlane nodes. */
interface SwimlaneEdge {
    /** ID of the source node. */
    from: string;
    /** ID of the target node. */
    to: string;
    /** Optional label shown on the edge. */
    label?: string;
}
/** Options passed to {@link createSwimlaneDiagram}. */
interface SwimlaneDiagramOptions {
    /**
     * Lane identifiers in display order. Each string is used as both the lane ID
     * and its visible label.
     */
    lanes: string[];
    /** Nodes placed inside their respective lanes. */
    nodes: SwimlaneNode[];
    /** Directed edges between nodes (may cross lane boundaries). */
    edges: SwimlaneEdge[];
    /** Light or dark rendering mode (default: 'light'). */
    theme?: ThemeType;
    /** Color palette (default: `'default'`). */
    palette?: PaletteType;
    /** Optional chart title. */
    title?: string;
    /** Optional subtitle. */
    subtitle?: string;
}
/** Options for the unified {@link fig} function — select the diagram type with `figure`. */
type FigOptions = ({
    figure: 'flow';
} & FlowChartOptions) | ({
    figure: 'tree';
} & TreeDiagramOptions) | ({
    figure: 'arch';
} & ArchDiagramOptions) | ({
    figure: 'sequence';
} & SequenceDiagramOptions) | ({
    figure: 'quadrant';
} & QuadrantChartOptions) | ({
    figure: 'gantt';
} & GanttChartOptions) | ({
    figure: 'state';
} & StateDiagramOptions) | ({
    figure: 'er';
} & ErDiagramOptions) | ({
    figure: 'timeline';
} & TimelineDiagramOptions) | ({
    figure: 'swimlane';
} & SwimlaneDiagramOptions);

/**
 * Generate an SVG diagram from either a Mermaid-like markdown string or a JSON config object.
 *
 * **String input** — treated as a markdown diagram definition (see below).
 * Fault-tolerant: never throws. If the input is empty, partial, or unparseable
 * (e.g. while an AI is still streaming output) a 1×1 empty SVG is returned.
 * As more content is appended the diagram renders progressively.
 *
 * **Object input** — a typed {@link FigOptions} config. The `figure` field selects
 * the diagram type:
 * - `'flow'`     — flowchart (nodes + edges + optional groups)
 * - `'tree'`     — tree / hierarchy (flat node list with parent refs)
 * - `'arch'`     — architecture diagram (layered grid, no edges)
 * - `'sequence'` — sequence diagram (actors + message arrows)
 * - `'quadrant'` — quadrant chart (2×2 matrix with data points)
 * - `'gantt'`    — Gantt chart (task bars, optional milestones, optional groups)
 * - `'state'`    — state machine (states + transitions, UML pseudo-states)
 * - `'er'`       — ER / data model (entities with fields, relationships)
 * - `'timeline'` — timeline (events plotted on a horizontal date axis)
 * - `'swimlane'` — swimlane (cross-functional flow with lane bands)
 *
 * Returns a fully self-contained SVG string; no coordinates needed.
 *
 * @example
 * ```ts
 * // Markdown string (AI-friendly, streaming-safe)
 * fig(`
 *   flow LR antv
 *   title: CI Pipeline
 *   code[Write Code] --> test{Tests Pass?}
 *   test -->|yes| build[Build Image]
 *   test -->|no| fix((Fix Issues))
 * `);
 *
 * // JSON config object (typed, programmatic)
 * fig({ figure: 'flow', nodes: [...], edges: [...] });
 * ```
 */
declare function fig(input: string | FigOptions): string;

export { type ArchDiagramOptions, type ArchLayer, type ArchNode, type Direction, type ErDiagramOptions, type ErEntity, type ErField, type ErFieldKey, type ErRelation, type FigOptions, type FlowChartOptions, type FlowEdge, type FlowGroup, type FlowNode, type GanttChartOptions, type GanttMilestone, type GanttTask, type NodeType, type QuadrantChartOptions, type QuadrantPoint, type SeqMessage, type SequenceDiagramOptions, type StateDiagramOptions, type StateNode, type StateNodeType, type StateTransition, type SwimlaneDiagramOptions, type SwimlaneEdge, type SwimlaneNode, type ThemeType, type TimelineDiagramOptions, type TimelineEvent, type TreeDiagramOptions, type TreeNode, fig };
