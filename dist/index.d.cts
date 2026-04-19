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
} & GanttChartOptions);

/**
 * Parse a Mermaid-like markdown diagram definition and return a {@link FigOptions} object.
 *
 * The first non-empty line is the **header**: `<type> [direction] [theme] [palette]`
 *
 * - `type`      — one of `flow`, `tree`, `arch`, `sequence`, `quadrant`, `gantt`
 * - `direction` — `TB` (top→bottom) or `LR` (left→right); applies to flow / tree / arch
 * - `theme`     — `light` (default) or `dark`
 * - `palette`   — any named palette: `default`, `antv`, `drawio`, `figma`, `vega`,
 *                 `mono-blue`, `mono-green`, `mono-purple`, `mono-orange`
 *
 * Lines starting with `%%` are treated as comments and ignored.
 * `title:` and `subtitle:` meta-lines are supported in all diagram types.
 *
 * Throws if the input is empty or the figure type is not recognised.
 * For a fault-tolerant render path that never throws (useful with streaming AI output),
 * use `fig(markdown)` instead.
 *
 * @example
 * ```
 * parseFigmd(`
 *   flow LR antv
 *   title: CI Pipeline
 *   code[Write Code] --> test{Tests Pass?}
 *   test -->|yes| build[Build Image]
 *   test -->|no| fix((Fix Issues))
 *   build --> deploy[/Deploy/]
 *   group Pipeline: code, test, build, deploy
 * `);
 * ```
 */
declare function parseFigmd(markdown: string): FigOptions;

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
/**
 * Parse a Mermaid-like markdown diagram definition and render it as an SVG string.
 *
 * Equivalent to `fig(markdown)`. Provided as a named convenience export.
 * For streaming / fault-tolerant rendering prefer `fig(markdown)` directly.
 */
declare function figmd(markdown: string): string;

export { type ArchDiagramOptions, type ArchLayer, type ArchNode, type Direction, type FigOptions, type FlowChartOptions, type FlowEdge, type FlowGroup, type FlowNode, type GanttChartOptions, type GanttMilestone, type GanttTask, type NodeType, type QuadrantChartOptions, type QuadrantPoint, type SeqMessage, type SequenceDiagramOptions, type ThemeType, type TreeDiagramOptions, type TreeNode, fig, figmd, parseFigmd };
