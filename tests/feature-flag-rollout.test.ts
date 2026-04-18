import { it } from 'vitest';
import { createFlowChart } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('feature flag rollout — clean theme, LR direction', () => {
  const svg = createFlowChart({
    nodes: [
      { id: 'request', label: 'Incoming Request', type: 'terminal' },
      { id: 'flag_enabled', label: 'Flag Enabled?', type: 'decision' },
      { id: 'user_segment', label: 'In Target Segment?', type: 'decision' },
      { id: 'canary', label: 'Canary %?', type: 'decision' },
      { id: 'new_feature', label: 'New Feature', type: 'process' },
      { id: 'old_feature', label: 'Existing Feature', type: 'process' },
      { id: 'log_metrics', label: 'Log Metrics', type: 'io' },
      { id: 'respond', label: 'Send Response', type: 'terminal' },
    ],
    edges: [
      { from: 'request', to: 'flag_enabled' },
      { from: 'flag_enabled', to: 'user_segment', label: 'Yes' },
      { from: 'flag_enabled', to: 'old_feature', label: 'No' },
      { from: 'user_segment', to: 'canary', label: 'Yes' },
      { from: 'user_segment', to: 'old_feature', label: 'No' },
      { from: 'canary', to: 'new_feature', label: 'In' },
      { from: 'canary', to: 'old_feature', label: 'Out' },
      { from: 'new_feature', to: 'log_metrics' },
      { from: 'old_feature', to: 'log_metrics' },
      { from: 'log_metrics', to: 'respond' },
    ],
    theme: 'clean',
    direction: 'LR',
  });
  matchSvgSnapshot('feature-flag-rollout', svg);
});
