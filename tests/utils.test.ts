import { describe, expect, it } from 'vitest';
import { estimateTextWidth } from '../src/utils';

describe('utils', () => {
  it('handles keyword font weights when estimating text width', () => {
    expect(estimateTextWidth('Timeline', 13, 'bold')).toBeGreaterThan(
      estimateTextWidth('Timeline', 13, 'normal'),
    );
    expect(estimateTextWidth('Timeline', 13, '700')).toBe(
      estimateTextWidth('Timeline', 13, 'bold'),
    );
  });
});
