import { it } from 'vitest';
import { createFlowChart } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('content moderation pipeline — excalidraw theme, LR direction, 3 groups', () => {
  const svg = createFlowChart({
    nodes: [
      { id: 'post', label: 'User Post', type: 'io' },
      { id: 'hash_check', label: 'Hash Blocklist', type: 'process' },
      { id: 'hash_hit', label: 'Blocked Hash?', type: 'decision' },
      { id: 'auto_remove', label: 'Auto Remove', type: 'terminal' },
      { id: 'text_scan', label: 'Text Classifier', type: 'process' },
      { id: 'image_scan', label: 'Image Classifier', type: 'process' },
      { id: 'risk', label: 'Risk Score > 0.8?', type: 'decision' },
      { id: 'human', label: 'Human Review Queue', type: 'process' },
      { id: 'reviewer', label: 'Reviewer Decision', type: 'decision' },
      { id: 'approve', label: 'Approve & Publish', type: 'terminal' },
      { id: 'remove', label: 'Remove & Notify', type: 'terminal' },
    ],
    edges: [
      { from: 'post', to: 'hash_check' },
      { from: 'hash_check', to: 'hash_hit' },
      { from: 'hash_hit', to: 'auto_remove', label: 'Yes' },
      { from: 'hash_hit', to: 'text_scan', label: 'No' },
      { from: 'hash_hit', to: 'image_scan', label: 'No' },
      { from: 'text_scan', to: 'risk' },
      { from: 'image_scan', to: 'risk' },
      { from: 'risk', to: 'human', label: 'High' },
      { from: 'risk', to: 'approve', label: 'Low' },
      { from: 'human', to: 'reviewer' },
      { from: 'reviewer', to: 'approve', label: 'OK' },
      { from: 'reviewer', to: 'remove', label: 'Violates' },
    ],
    groups: [
      { id: 'auto', label: 'Automated Checks', nodes: ['hash_check', 'hash_hit', 'text_scan', 'image_scan', 'risk'] },
      { id: 'manual', label: 'Manual Review', nodes: ['human', 'reviewer'] },
    ],
    theme: 'excalidraw',
    direction: 'LR',
  });
  matchSvgSnapshot('content-moderation', svg);
});
