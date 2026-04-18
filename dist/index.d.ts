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

declare function renderFlowChart(options: FlowChartOptions): string;

export { type Direction, type FlowChartOptions, type FlowEdge, type FlowGroup, type FlowNode, type NodeType, type ThemeType, renderFlowChart as createFlowChart };
