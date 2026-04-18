/**
 * Node type in the flowchart.
 * - process: default rectangle
 * - decision: diamond shape (for conditionals)
 * - terminal: rounded rectangle (start / end)
 * - io: parallelogram (input / output)
 */
export type NodeType = 'process' | 'decision' | 'terminal' | 'io';

/** Layout direction of the graph. */
export type Direction = 'TB' | 'LR';

/** Light or dark rendering mode. */
export type ThemeType = 'light' | 'dark';

/**
 * Color palette — one of:
 * - `'default'` — the built-in multi-hue palette (default when omitted)
 * - Any `d3-scale-chromatic` scheme name **without** the `scheme` prefix, e.g.:
 *   - Categorical: `'category10'`, `'set1'`, `'set2'`, `'set3'`,
 *     `'accent'`, `'dark2'`, `'paired'`, `'pastel1'`, `'pastel2'`, `'tableau10'`
 *   - Sequential: `'blues'`, `'greens'`, `'oranges'`, `'reds'`, etc.
 *   - Diverging: `'brBG'`, `'piYG'`, `'rdBu'`, etc.
 * - Custom 4-element hex array `[process, decision, terminal, io]`
 */
export type PaletteType = string | string[];

/** A single node in the flowchart. */
export interface FlowNode {
  /** Unique identifier. */
  id: string;
  /** Text displayed inside the node. */
  label: string;
  /** Visual shape of the node (default: 'process'). */
  type?: NodeType;
}

/** A directed edge connecting two nodes. */
export interface FlowEdge {
  /** ID of the source node. */
  from: string;
  /** ID of the target node. */
  to: string;
  /** Optional label displayed along the edge. */
  label?: string;
}

/** A logical group of nodes rendered with a dashed border. */
export interface FlowGroup {
  /** Unique identifier. */
  id: string;
  /** Label displayed above the group border. */
  label: string;
  /** IDs of nodes belonging to this group. */
  nodes: string[];
}

/** Options passed to {@link createFlowChart}. */
export interface FlowChartOptions {
  /** List of nodes to render. */
  nodes: FlowNode[];
  /** List of directed edges. */
  edges: FlowEdge[];
  /** Optional logical groups. */
  groups?: FlowGroup[];
  /** Light or dark rendering mode (default: 'light'). */
  theme?: ThemeType;
  /**
   * Color palette — `'default'` (built-in), any d3-scale-chromatic scheme name
   * (categorical, sequential, or diverging), or a custom
   * 4-element hex array `[process, decision, terminal, io]` (default: 'default').
   */
  palette?: PaletteType;
  /** Graph layout direction (default: 'TB' — top to bottom). */
  direction?: Direction;
  /** Optional chart title displayed above the diagram. */
  title?: string;
  /** Optional subtitle displayed beneath the title. */
  subtitle?: string;
}

// ---------------------------------------------------------------------------
// TreeDiagram types
// ---------------------------------------------------------------------------

/** A node in a tree diagram (flat array with parent reference). */
export interface TreeNode {
  /** Unique identifier. */
  id: string;
  /** Text displayed inside the node. */
  label: string;
  /** ID of the parent node. Root nodes omit this field. */
  parent?: string;
}

/** Options passed to {@link createTreeDiagram}. */
export interface TreeDiagramOptions {
  /** Flat list of nodes with optional parent references. */
  nodes: TreeNode[];
  /** Light or dark rendering mode (default: 'light'). */
  theme?: ThemeType;
  /** Color palette — `'default'` (built-in), d3-scale-chromatic short name (e.g. `'blues'`), or custom hex array (default: `'default'`). */
  palette?: PaletteType;
  /** Layout direction (default: 'TB'). */
  direction?: Direction;
  /** Optional chart title displayed above the diagram. */
  title?: string;
  /** Optional subtitle displayed beneath the title. */
  subtitle?: string;
}

// ---------------------------------------------------------------------------
// ArchDiagram types
// ---------------------------------------------------------------------------

/** A single node inside an architecture layer. */
export interface ArchNode {
  /** Unique identifier. */
  id: string;
  /** Text displayed inside the node. */
  label: string;
}

/** A horizontal layer in an architecture diagram. */
export interface ArchLayer {
  /** Unique identifier. */
  id: string;
  /** Label shown at the top of the layer row. */
  label: string;
  /** Nodes displayed inside this layer. */
  nodes: ArchNode[];
}

/** Options passed to {@link createArchDiagram}. */
export interface ArchDiagramOptions {
  /** List of layers from top to bottom (TB) or left to right (LR). */
  layers: ArchLayer[];
  /** Light or dark rendering mode (default: 'light'). */
  theme?: ThemeType;
  /** Color palette — `'default'` (built-in), d3-scale-chromatic short name (e.g. `'blues'`), or custom hex array (default: `'default'`). */
  palette?: PaletteType;
  /** Direction: TB = layers top-to-bottom, LR = layers left-to-right (default: 'TB'). */
  direction?: Direction;
  /** Optional chart title displayed above the diagram. */
  title?: string;
  /** Optional subtitle displayed beneath the title. */
  subtitle?: string;
}

// ---------------------------------------------------------------------------
// SequenceDiagram types
// ---------------------------------------------------------------------------

/** A message arrow between two actors in a sequence diagram. */
export interface SeqMessage {
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
export interface SequenceDiagramOptions {
  /** Ordered list of participant names. */
  actors: string[];
  /** Ordered list of messages between actors. */
  messages: SeqMessage[];
  /** Light or dark rendering mode (default: 'light'). */
  theme?: ThemeType;
  /** Color palette — `'default'` (built-in), d3-scale-chromatic short name (e.g. `'blues'`), or custom hex array (default: `'default'`). */
  palette?: PaletteType;
  /** Optional chart title displayed above the diagram. */
  title?: string;
  /** Optional subtitle displayed beneath the title. */
  subtitle?: string;
}

// ---------------------------------------------------------------------------
// QuadrantChart types
// ---------------------------------------------------------------------------

/** A single data point in a quadrant chart. */
export interface QuadrantPoint {
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
export interface QuadrantChartOptions {
  /** X-axis configuration. */
  xAxis: { label: string; min: string; max: string };
  /** Y-axis configuration. */
  yAxis: { label: string; min: string; max: string };
  /** Labels for the four quadrants: [top-left, top-right, bottom-left, bottom-right]. */
  quadrants: [string, string, string, string];
  /** Data points to plot. */
  points: QuadrantPoint[];
  /** Light or dark rendering mode (default: 'light'). */
  theme?: ThemeType;
  /** Color palette — `'default'` (built-in), d3-scale-chromatic short name (e.g. `'blues'`), or custom hex array (default: `'default'`). */
  palette?: PaletteType;
  /** Optional chart title displayed above the diagram. */
  title?: string;
  /** Optional subtitle displayed beneath the title. */
  subtitle?: string;
}

// ---------------------------------------------------------------------------
// Unified fig() API
// ---------------------------------------------------------------------------

/** Options for the unified {@link fig} function — select the diagram type with `figure`. */
export type FigOptions =
  | ({ figure: 'flow' } & FlowChartOptions)
  | ({ figure: 'tree' } & TreeDiagramOptions)
  | ({ figure: 'arch' } & ArchDiagramOptions)
  | ({ figure: 'sequence' } & SequenceDiagramOptions)
  | ({ figure: 'quadrant' } & QuadrantChartOptions);
