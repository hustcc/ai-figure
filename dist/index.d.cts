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
/** Visual theme. */
type ThemeType = 'excalidraw' | 'clean';
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
    /** Visual theme (default: 'excalidraw'). */
    theme?: ThemeType;
    /** Graph layout direction (default: 'TB' — top to bottom). */
    direction?: Direction;
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
    /** Visual theme (default: 'excalidraw'). */
    theme?: ThemeType;
    /** Layout direction (default: 'TB'). */
    direction?: Direction;
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
    /** Visual theme (default: 'excalidraw'). */
    theme?: ThemeType;
    /** Direction: TB = layers top-to-bottom, LR = layers left-to-right (default: 'TB'). */
    direction?: Direction;
    /** Total diagram width in pixels (default: 800). */
    width?: number;
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
    /** Visual theme (default: 'excalidraw'). */
    theme?: ThemeType;
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
    /** Visual theme (default: 'excalidraw'). */
    theme?: ThemeType;
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
} & QuadrantChartOptions);

/**
 * Generate an SVG diagram. The `figure` field selects the diagram type:
 * - `'flow'`     — flowchart (nodes + edges + optional groups)
 * - `'tree'`     — tree / hierarchy (flat node list with parent refs)
 * - `'arch'`     — architecture diagram (layered grid, no edges)
 * - `'sequence'` — sequence diagram (actors + message arrows)
 * - `'quadrant'` — quadrant chart (2×2 matrix with data points)
 *
 * Returns a fully self-contained SVG string; no coordinates needed.
 */
declare function fig(options: FigOptions): string;

export { type ArchDiagramOptions, type ArchLayer, type ArchNode, type Direction, type FigOptions, type FlowChartOptions, type FlowEdge, type FlowGroup, type FlowNode, type NodeType, type QuadrantChartOptions, type QuadrantPoint, type SeqMessage, type SequenceDiagramOptions, type ThemeType, type TreeDiagramOptions, type TreeNode, fig };
