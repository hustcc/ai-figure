import type { NodeType, ThemeType, PaletteType } from './types';

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
  /** SVG canvas background color. Empty string means transparent (no rect rendered). */
  background: string;
}

// Ordered node types for array-based palette mapping.
const NODE_TYPES: NodeType[] = ['process', 'decision', 'terminal', 'io'];

// ---------------------------------------------------------------------------
// Built-in palettes — each with light and dark variants
// ---------------------------------------------------------------------------

type Mode = 'light' | 'dark';

const palettes: Record<string, Record<Mode, ThemeConfig>> = {
  /**
   * Default palette — vibrant pastel fills with semantically consistent colors.
   * process=blue, decision=amber, terminal=green, io=purple.
   * Also accessible as `'colorful'`.
   */
  default: {
    light: {
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
      edgeColor:  '#495057',
      edgeWidth:  1.5,
      groupColor: '#868e96',
      groupFill:  'rgba(134,142,150,0.06)',
      background: '',
    },
    dark: {
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fontSize: 14,
      strokeWidth: 2,
      cornerRadius: 6,
      nodeFills: {
        process:  '#1c2e44',
        decision: '#3d2800',
        terminal: '#1a3820',
        io:       '#2d1a38',
      },
      nodeStrokes: {
        process:  '#339af0',
        decision: '#f59f00',
        terminal: '#51cf66',
        io:       '#cc5de8',
      },
      textColors: {
        process:  '#74c0fc',
        decision: '#ffd43b',
        terminal: '#8ce99a',
        io:       '#e599f7',
      },
      edgeColor:  '#adb5bd',
      edgeWidth:  1.5,
      groupColor: '#5c6370',
      groupFill:  'rgba(92,99,112,0.15)',
      background: '#1a1b1e',
    },
  },

  /**
   * Minimal palette — single blue hue family; fill depth (not hue) differentiates
   * node types. Thin 1px strokes, larger corner radius, neutral group/edge colors.
   */
  minimal: {
    light: {
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
      edgeColor:  '#555555',
      edgeWidth:  1.5,
      groupColor: '#adb5bd',
      groupFill:  'rgba(173,181,189,0.06)',
      background: '',
    },
    dark: {
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fontSize: 14,
      strokeWidth: 1,
      cornerRadius: 8,
      nodeFills: {
        process:  '#1a2a3d',
        decision: '#152034',
        terminal: '#0f1a28',
        io:       '#1e2f42',
      },
      nodeStrokes: {
        process:  '#4dabf7',
        decision: '#74c0fc',
        terminal: '#a5d8ff',
        io:       '#339af0',
      },
      textColors: {
        process:  '#a5d8ff',
        decision: '#74c0fc',
        terminal: '#4dabf7',
        io:       '#bde0fe',
      },
      edgeColor:  '#6c757d',
      edgeWidth:  1.5,
      groupColor: '#495057',
      groupFill:  'rgba(73,80,87,0.2)',
      background: '#1a1b1e',
    },
  },
};

// `colorful` is an alias for `default`.
palettes['colorful'] = palettes['default'];

// ---------------------------------------------------------------------------
// D3 categorical color schemes (inlined — no external dependency).
// Names follow the d3-scale-chromatic convention so users can pass them directly.
// Each entry lists enough colors to cover the 4 node types; extras are ignored.
// ---------------------------------------------------------------------------

const d3Schemes: Record<string, string[]> = {
  schemeCategory10: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
  schemeAccent:     ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'],
  schemeDark2:      ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],
  schemePaired:     ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00'],
  schemePastel1:    ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec'],
  schemePastel2:    ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc', '#cccccc'],
  schemeSet1:       ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf'],
  schemeSet2:       ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],
  schemeSet3:       ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5'],
  schemeTableau10:  ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948', '#b07aa1', '#ff9da7'],
};

// ---------------------------------------------------------------------------
// Custom palette derivation
// ---------------------------------------------------------------------------

/**
 * Derive a full ThemeConfig from an array of accent colors.
 * The array maps to [process, decision, terminal, io] in order.
 * If fewer than 4 colors are provided, they are cycled.
 */
function deriveThemeFromColors(colors: string[], mode: Mode): ThemeConfig {
  const base = palettes['default'][mode];
  const fills: Record<NodeType, string> = {} as Record<NodeType, string>;
  const strokes: Record<NodeType, string> = {} as Record<NodeType, string>;
  const texts: Record<NodeType, string> = {} as Record<NodeType, string>;

  NODE_TYPES.forEach((type, i) => {
    const color = colors[i % colors.length];
    strokes[type] = color;
    // Fill: color + low-opacity hex suffix (works for 6-digit hex colors).
    fills[type] = color + (mode === 'dark' ? '30' : '1a');
    texts[type] = color;
  });

  return { ...base, nodeFills: fills, nodeStrokes: strokes, textColors: texts };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Resolve the final ThemeConfig from palette and mode options.
 *
 * @param palette - One of:
 *   - Built-in palette name: `'default'` (alias `'colorful'`) | `'minimal'`
 *   - D3 categorical scheme name: `'schemeCategory10'`, `'schemeSet1'`, etc.
 *   - Custom hex array `[process, decision, terminal, io]`
 *   Defaults to `'default'`.
 * @param mode - `'light'` or `'dark'`. Defaults to `'light'`.
 */
export function resolveTheme(
  palette: PaletteType | undefined,
  mode: ThemeType | undefined,
): ThemeConfig {
  const m: Mode = mode === 'dark' ? 'dark' : 'light';

  if (Array.isArray(palette)) {
    return deriveThemeFromColors(palette, m);
  }

  if (typeof palette === 'string') {
    // Named built-in palette (includes 'default', 'colorful', 'minimal')
    if (palette in palettes) {
      return palettes[palette][m];
    }
    // D3 categorical scheme name
    if (palette in d3Schemes) {
      return deriveThemeFromColors(d3Schemes[palette], m);
    }
  }

  // Fallback to default palette
  return palettes['default'][m];
}
