import rough from 'roughjs';
import type { Options as RoughOptions } from 'roughjs/bin/core';

export type { Options as RoughOptions } from 'roughjs/bin/core';

export interface PathInfo {
  d: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  strokeLineDash?: number[];
}

/** Shared generator instance (stateless except for per-call options). */
const gen = rough.generator();

function drawable2paths(drawable: ReturnType<typeof gen.rectangle>): PathInfo[] {
  return gen.toPaths(drawable) as PathInfo[];
}

/** Hand-drawn rectangle. */
export function roughRect(
  x: number,
  y: number,
  w: number,
  h: number,
  options: RoughOptions,
): PathInfo[] {
  return drawable2paths(gen.rectangle(x, y, w, h, options));
}

/** Hand-drawn rounded rectangle (terminal nodes). */
export function roughRoundedRect(
  x: number,
  y: number,
  w: number,
  h: number,
  rx: number,
  options: RoughOptions,
): PathInfo[] {
  const r = Math.min(rx, w / 2, h / 2);
  const d =
    `M${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} ` +
    `V${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} ` +
    `H${x + r} Q${x},${y + h} ${x},${y + h - r} V${y + r} Q${x},${y} ${x + r},${y} Z`;
  return drawable2paths(gen.path(d, options));
}

/** Hand-drawn diamond (decision nodes). */
export function roughDiamond(
  cx: number,
  cy: number,
  w: number,
  h: number,
  options: RoughOptions,
): PathInfo[] {
  const d = `M${cx},${cy - h / 2} L${cx + w / 2},${cy} L${cx},${cy + h / 2} L${cx - w / 2},${cy} Z`;
  return drawable2paths(gen.path(d, options));
}

/** Hand-drawn parallelogram (IO nodes). */
export function roughParallelogram(
  x: number,
  y: number,
  w: number,
  h: number,
  skew: number,
  options: RoughOptions,
): PathInfo[] {
  const d = `M${x + skew},${y} L${x + w},${y} L${x + w - skew},${y + h} L${x},${y + h} Z`;
  return drawable2paths(gen.path(d, options));
}

/**
 * Hand-drawn curve through a series of waypoints.
 * Falls back to a straight line for two points.
 */
export function roughCurve(
  points: { x: number; y: number }[],
  options: RoughOptions,
): PathInfo[] {
  if (points.length === 0) return [];

  if (points.length === 2) {
    return drawable2paths(
      gen.line(points[0].x, points[0].y, points[1].x, points[1].y, options),
    );
  }

  const pts = points.map((p) => [p.x, p.y] as [number, number]);
  return drawable2paths(gen.curve(pts, options));
}
