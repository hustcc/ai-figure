import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const SNAPSHOTS_DIR = join(__dirname, 'snapshots');

/**
 * Custom SVG file snapshot assertion.
 *
 * - First run (or when UPDATE_SNAPSHOTS=1): writes `tests/snapshots/<name>.svg`
 *   and passes — the file can be opened in any browser for preview.
 * - Subsequent runs: compares the current SVG string to the stored file and
 *   throws a descriptive error on mismatch.
 *
 * To update all snapshots: `UPDATE_SNAPSHOTS=1 npm test`
 */
export function matchSvgSnapshot(name: string, svg: string): void {
  mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  const filePath = join(SNAPSHOTS_DIR, `${name}.svg`);

  if (!existsSync(filePath) || process.env['UPDATE_SNAPSHOTS'] === '1') {
    writeFileSync(filePath, svg, 'utf-8');
    return;
  }

  const stored = readFileSync(filePath, 'utf-8');
  if (svg !== stored) {
    throw new Error(
      `SVG snapshot mismatch for "${name}".\n` +
        `Run UPDATE_SNAPSHOTS=1 npm test to regenerate.\n` +
        `File: ${filePath}`,
    );
  }
}
