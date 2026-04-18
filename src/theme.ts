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
   * Colorful theme — vibrant pastel fills with semantically consistent colors.
   * process=blue, decision=amber, terminal=green, io=purple.
   * Crisp clean SVG with 2px strokes and a lively multi-hue palette.
   */
  colorful: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: 14,
    strokeWidth: 2,
    cornerRadius: 6,
    nodeFills: {
      process:  '#e7f5ff',
      decision: '#fff7e6',
      terminal: '#ebfbee',
      io:       '#fdf4ff',
    },
    nodeStrokes: {
      process:  '#339af0',
      decision: '#f59f00',
      terminal: '#51cf66',
      io:       '#cc5de8',
    },
    textColors: {
      process:  '#1971c2',
      decision: '#e67700',
      terminal: '#2f9e44',
      io:       '#862e9c',
    },
    edgeColor: '#495057',
    edgeWidth: 1.5,
    groupColor: '#868e96',
    groupFill:  'rgba(134,142,150,0.06)',
  },

  /**
   * Minimal theme — single blue hue family; fill depth (not hue) differentiates
   * node types. Thin 1px strokes, larger corner radius, neutral group/edge colors.
   */
  minimal: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: 14,
    strokeWidth: 1,
    cornerRadius: 8,
    nodeFills: {
      process:  '#e8f4fd',
      decision: '#d4eaf9',
      terminal: '#bbdefb',
      io:       '#f0f8ff',
    },
    nodeStrokes: {
      process:  '#42a5f5',
      decision: '#1976d2',
      terminal: '#1565c0',
      io:       '#90caf9',
    },
    textColors: {
      process:  '#1565c0',
      decision: '#0d47a1',
      terminal: '#0a3566',
      io:       '#1976d2',
    },
    edgeColor: '#555555',
    edgeWidth: 1.5,
    groupColor: '#adb5bd',
    groupFill:  'rgba(173,181,189,0.06)',
  },
};
