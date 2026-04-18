import * as d3chromatic from 'd3-scale-chromatic';
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
// Built-in palette — light and dark variants
// ---------------------------------------------------------------------------

type Mode = 'light' | 'dark';

/**
 * The single built-in named palette (`'default'`).
 * Vibrant pastel fills with semantically consistent colors:
 * process=blue, decision=amber, terminal=green, io=purple.
 */
const defaultPalette: Record<Mode, ThemeConfig> = {
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
};

// ---------------------------------------------------------------------------
// D3 scheme resolution (d3-scale-chromatic)
// ---------------------------------------------------------------------------

/**
 * Resolve an array of 4+ accent colors from a d3-scale-chromatic scheme name.
 * Expects the **full** key including the `scheme` prefix (e.g. `'schemeBlues'`).
 *
 * - **Categorical** schemes (e.g. `schemeCategory10`, `schemeSet1`) export a flat
 *   `string[]` — returned as-is.
 * - **Sequential / Diverging** schemes (e.g. `schemeBlues`, `schemeBrBG`) export a
 *   nested `(readonly string[])[]` indexed by color count (3–9 or 3–11).  The
 *   9-color variant is used, and 4 evenly-spaced values (indices 1, 3, 5, 7) are
 *   returned to provide good visual contrast while avoiding the extremes.
 *
 * Returns `null` if `schemeName` is not found in d3-scale-chromatic.
 */
function resolveD3Scheme(schemeName: string): string[] | null {
  const entry = (d3chromatic as Record<string, unknown>)[schemeName];
  if (!entry || !Array.isArray(entry)) return null;

  const arr = entry as unknown[];

  // Categorical: flat array whose first element is a string.
  if (typeof arr[0] === 'string') {
    return arr as string[];
  }

  // Sequential/Diverging: nested array whose element at index 3 is an array.
  if (Array.isArray(arr[3])) {
    const nested = entry as ReadonlyArray<ReadonlyArray<string>>;
    // Prefer the 9-color variant; fall back to the largest available.
    const colors: ReadonlyArray<string> = nested[9] ?? nested[nested.length - 1];
    if (!colors || colors.length < 4) return null;
    if (colors.length >= 8) {
      // Pick 4 evenly-spaced samples at indices 1, 3, 5, 7, skipping extremes.
      return [colors[1], colors[3], colors[5], colors[7]];
    }
    return [...colors];
  }

  return null;
}

// ---------------------------------------------------------------------------
// Color derivation from accent array
// ---------------------------------------------------------------------------

/**
 * Derive a full ThemeConfig from an array of accent colors.
 * The array maps to `[process, decision, terminal, io]` in order.
 * If fewer than 4 colors are provided, they are cycled.
 */
function deriveThemeFromColors(colors: string[], mode: Mode): ThemeConfig {
  const base = defaultPalette[mode];
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
 *   - `'default'` — the built-in multi-hue palette (default when omitted)
 *   - Any `d3-scale-chromatic` scheme name **without** the `scheme` prefix,
 *     e.g. `'category10'`, `'set1'`, `'blues'`, `'brBG'` — both categorical
 *     and sequential/diverging schemes are supported. The `scheme` prefix is
 *     prepended internally before the d3-scale-chromatic lookup.
 *   - Custom hex array `[process, decision, terminal, io]`
 * @param mode - `'light'` or `'dark'`. Defaults to `'light'`.
 */
export function resolveTheme(
  palette: PaletteType | undefined,
  mode: ThemeType | undefined,
): ThemeConfig {
  const m: Mode = mode === 'dark' ? 'dark' : 'light';

  // Custom color array.
  if (Array.isArray(palette)) {
    return deriveThemeFromColors(palette, m);
  }

  if (typeof palette === 'string') {
    // Built-in named palette.
    if (palette === 'default') {
      return defaultPalette[m];
    }
    // d3-scale-chromatic scheme name — accept short form (e.g. 'blues') by
    // prepending 'scheme' + capitalising the first letter ('schemeBlues').
    const d3key = 'scheme' + palette.charAt(0).toUpperCase() + palette.slice(1);
    const d3colors = resolveD3Scheme(d3key);
    if (d3colors) {
      return deriveThemeFromColors(d3colors, m);
    }
  }

  // Fallback: built-in default palette.
  return defaultPalette[m];
}
