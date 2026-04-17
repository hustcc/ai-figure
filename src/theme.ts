import type { NodeType, ThemeType } from './types';

export interface ThemeConfig {
  fontFamily: string;
  fontSize: number;
  strokeWidth: number;
  cornerRadius: number;
  nodeFills: Record<NodeType, string>;
  nodeStrokes: Record<NodeType, string>;
  textColors: Record<NodeType, string>;
  edgeColor: string;
  edgeWidth: number;
  groupColor: string;
  groupFill: string;
}

export const themes: Record<ThemeType, ThemeConfig> = {
  /**
   * Colorful theme — vibrant pastel fills with matched border/text colors.
   * Inspired by Excalidraw's color palette, rendered as crisp clean SVG.
   */
  excalidraw: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: 14,
    strokeWidth: 2,
    cornerRadius: 6,
    nodeFills: {
      process:  '#fff7e6',
      decision: '#e7f5ff',
      terminal: '#ebfbee',
      io:       '#fdf4ff',
    },
    nodeStrokes: {
      process:  '#f59f00',
      decision: '#339af0',
      terminal: '#51cf66',
      io:       '#cc5de8',
    },
    textColors: {
      process:  '#e67700',
      decision: '#1971c2',
      terminal: '#2f9e44',
      io:       '#862e9c',
    },
    edgeColor: '#495057',
    edgeWidth: 1.5,
    groupColor: '#adb5bd',
    groupFill:  'rgba(173,181,189,0.06)',
  },

  /**
   * Minimal theme — excalidraw-inspired clean shapes.
   * Neutral fills, typed border/text colors, Inter font.
   */
  clean: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: 14,
    strokeWidth: 1.5,
    cornerRadius: 6,
    nodeFills: {
      process:  '#e8f4fd',
      decision: '#fef9e7',
      terminal: '#eafaf1',
      io:       '#fdf2f8',
    },
    nodeStrokes: {
      process:  '#2196f3',
      decision: '#f39c12',
      terminal: '#27ae60',
      io:       '#8e44ad',
    },
    textColors: {
      process:  '#1565c0',
      decision: '#e65100',
      terminal: '#1b5e20',
      io:       '#6a1b9a',
    },
    edgeColor: '#555555',
    edgeWidth: 1.5,
    groupColor: '#999999',
    groupFill:  'rgba(153,153,153,0.06)',
  },
};
