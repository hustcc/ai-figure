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

/** Visual theme. */
export type ThemeType = 'excalidraw' | 'clean';

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
  /** Visual theme (default: 'excalidraw'). */
  theme?: ThemeType;
  /** Graph layout direction (default: 'TB' — top to bottom). */
  direction?: Direction;
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
  /** Visual theme (default: 'excalidraw'). */
  theme?: ThemeType;
  /** Layout direction (default: 'TB'). */
  direction?: Direction;
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
  /** Visual theme (default: 'excalidraw'). */
  theme?: ThemeType;
  /** Direction: TB = layers top-to-bottom, LR = layers left-to-right (default: 'TB'). */
  direction?: Direction;
  /** Total diagram width in pixels (default: 800). */
  width?: number;
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
  /** Visual theme (default: 'excalidraw'). */
  theme?: ThemeType;
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
  /** Visual theme (default: 'excalidraw'). */
  theme?: ThemeType;
}

// ---------------------------------------------------------------------------
// ComparisonTable types
// ---------------------------------------------------------------------------

/** A single row in a comparison table. */
export interface ComparisonRow {
  /** Row title shown in the first column. */
  feature: string;
  /** Values for each data column; length must equal `columns.length - 1`. */
  values: string[];
}

/** Options passed to {@link createComparisonTable}. */
export interface ComparisonTableOptions {
  /** Column headers; the first entry is the feature column header. */
  columns: string[];
  /** Data rows. */
  rows: ComparisonRow[];
  /** Visual theme (default: 'excalidraw'). */
  theme?: ThemeType;
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
  | ({ figure: 'quadrant' } & QuadrantChartOptions)
  | ({ figure: 'comparison' } & ComparisonTableOptions);
