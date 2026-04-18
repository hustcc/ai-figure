export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Naive text-wrapping based on estimated character width. */
export function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const avgCharWidth = fontSize * 0.58;
  const maxChars = Math.max(1, Math.floor(maxWidth / avgCharWidth));
  if (text.length <= maxChars) return [text];

  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [text];
}

// ---------------------------------------------------------------------------
// Title / subtitle helpers (shared across all renderers)
// ---------------------------------------------------------------------------

/**
 * Compute the pixel height of the title+subtitle block that is added above the
 * chart content when `title` or `subtitle` are provided.
 * Returns 0 when both are absent — callers can use this as a no-op guard.
 *
 * Layout (all measurements are in SVG user units / pixels):
 *   PAD_TOP   (16 px) — space above the first text baseline
 *   TITLE_FS  (fontSize + 4) — title font size (baseline-to-baseline height)
 *   INTER_GAP (6 px)  — gap between title baseline and subtitle cap-top
 *   SUBTITLE_FS (fontSize − 1) — subtitle font size
 *   PAD_BOTTOM (14 px) — space below the last text baseline
 */
export function titleBlockHeight(
  title: string | undefined,
  subtitle: string | undefined,
  fontSize: number,
): number {
  if (!title && !subtitle) return 0;

  const TITLE_FS    = fontSize + 4;   // 18 px at default fontSize=14
  const SUBTITLE_FS = fontSize - 1;   // 13 px at default fontSize=14
  const PAD_TOP     = 16;
  const INTER_GAP   = 6;
  const PAD_BOTTOM  = 14;

  return (
    PAD_TOP +
    (title ? TITLE_FS : 0) +
    (title && subtitle ? INTER_GAP : 0) +
    (subtitle ? SUBTITLE_FS : 0) +
    PAD_BOTTOM
  );
}

/**
 * Generate SVG `<text>` elements for an optional chart title and/or subtitle.
 * Both elements are horizontally centered at `cx`.
 * Returns an empty string when both title and subtitle are absent.
 *
 * Style conventions (aligned with AGENT.md design language):
 * - Title:    font-size = fontSize + 4 (18 px), font-weight="700",
 *             fill = titleColor (use theme.edgeColor — the primary text color).
 * - Subtitle: font-size = fontSize − 1 (13 px), default weight,
 *             fill = subtitleColor (use theme.groupColor — the secondary/muted color).
 *             No opacity attribute is used; the lighter fill achieves the
 *             visual hierarchy without violating the opacity rules in AGENT.md.
 *
 * @param title         - Optional main title text.
 * @param subtitle      - Optional secondary subtitle text.
 * @param cx            - Horizontal center x-coordinate in SVG space.
 * @param topY          - Top y-coordinate of the title block area.
 * @param fontFamily    - CSS font-family string (theme.fontFamily).
 * @param fontSize      - Base font size in px (theme.fontSize).
 * @param titleColor    - Fill color for title text (theme.edgeColor).
 * @param subtitleColor - Fill color for subtitle text (theme.groupColor).
 */
export function renderTitleBlock(
  title: string | undefined,
  subtitle: string | undefined,
  cx: number,
  topY: number,
  fontFamily: string,
  fontSize: number,
  titleColor: string,
  subtitleColor: string,
): string {
  if (!title && !subtitle) return '';

  const TITLE_FS    = fontSize + 4;
  const SUBTITLE_FS = fontSize - 1;
  const PAD_TOP     = 16;
  const INTER_GAP   = 6;

  const parts: string[] = [];

  if (title) {
    // Baseline of the title text: PAD_TOP below the top of the title area.
    const titleY = topY + PAD_TOP + TITLE_FS;
    parts.push(
      `<text x="${cx}" y="${titleY}" text-anchor="middle" ` +
        `font-family="${escapeXml(fontFamily)}" font-size="${TITLE_FS}" ` +
        `font-weight="700" fill="${escapeXml(titleColor)}">${escapeXml(title)}</text>`,
    );
  }

  if (subtitle) {
    // Subtitle sits below the title (when present) or takes the title's position.
    const subtitleY = title
      ? topY + PAD_TOP + TITLE_FS + INTER_GAP + SUBTITLE_FS
      : topY + PAD_TOP + SUBTITLE_FS;
    parts.push(
      `<text x="${cx}" y="${subtitleY}" text-anchor="middle" ` +
        `font-family="${escapeXml(fontFamily)}" font-size="${SUBTITLE_FS}" ` +
        `fill="${escapeXml(subtitleColor)}">${escapeXml(subtitle)}</text>`,
    );
  }

  return parts.join('\n');
}
