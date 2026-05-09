import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('mindmap — auto-balanced first-level branches, mono-blue dark', () => {
  const svg = fig({
    figure: 'mindmap',
    title: 'Launch Plan',
    palette: 'mono-blue',
    theme: 'dark',
    nodes: [
      { id: 'root', label: 'Launch Plan' },
      { id: 'product', label: 'Product', parent: 'root' },
      { id: 'go-to-market', label: 'Go To Market', parent: 'root' },
      { id: 'ops', label: 'Operations', parent: 'root' },
      { id: 'feature-1', label: 'Feature A', parent: 'product' },
      { id: 'feature-2', label: 'Feature B', parent: 'product' },
      { id: 'feature-3', label: 'Feature C', parent: 'product' },
      { id: 'feature-4', label: 'Feature D', parent: 'product' },
      { id: 'pricing', label: 'Pricing', parent: 'go-to-market' },
      { id: 'campaign', label: 'Campaign', parent: 'go-to-market' },
      { id: 'partners', label: 'Channel Partners', parent: 'go-to-market' },
      { id: 'support', label: 'Support Readiness', parent: 'ops' },
      { id: 'playbook', label: 'Escalation Playbook', parent: 'support' },
      { id: 'sla', label: 'SLA Rollout', parent: 'playbook' },
    ],
  });
  matchSvgSnapshot('mindmap-balanced-mono-blue-dark', svg);
});
