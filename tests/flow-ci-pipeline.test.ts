import { it } from 'vitest';
import { createFlowChart } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('CI/CD pipeline — clean theme, TB direction, 3 groups', () => {
  const svg = createFlowChart({
    nodes: [
      { id: 'commit', label: 'Git Commit', type: 'terminal' },
      { id: 'lint', label: 'Lint', type: 'process' },
      { id: 'unit', label: 'Unit Tests', type: 'process' },
      { id: 'build', label: 'Build', type: 'process' },
      { id: 'docker', label: 'Docker Build', type: 'process' },
      { id: 'gate', label: 'Quality Gate?', type: 'decision' },
      { id: 'staging', label: 'Deploy Staging', type: 'process' },
      { id: 'e2e', label: 'E2E Tests', type: 'process' },
      { id: 'approve', label: 'Approved?', type: 'decision' },
      { id: 'prod', label: 'Deploy Prod', type: 'process' },
      { id: 'notify_fail', label: 'Notify Failure', type: 'io' },
      { id: 'done', label: 'Released', type: 'terminal' },
    ],
    edges: [
      { from: 'commit', to: 'lint' },
      { from: 'lint', to: 'unit' },
      { from: 'unit', to: 'build' },
      { from: 'build', to: 'docker' },
      { from: 'docker', to: 'gate' },
      { from: 'gate', to: 'staging', label: 'Pass' },
      { from: 'gate', to: 'notify_fail', label: 'Fail' },
      { from: 'staging', to: 'e2e' },
      { from: 'e2e', to: 'approve' },
      { from: 'approve', to: 'prod', label: 'Yes' },
      { from: 'approve', to: 'notify_fail', label: 'No' },
      { from: 'prod', to: 'done' },
    ],
    groups: [
      { id: 'ci', label: 'CI', nodes: ['lint', 'unit', 'build', 'docker'] },
      { id: 'staging_env', label: 'Staging', nodes: ['staging', 'e2e'] },
      { id: 'production', label: 'Production', nodes: ['prod', 'done'] },
    ],
    theme: 'clean',
    direction: 'TB',
  });
  matchSvgSnapshot('flow-ci-pipeline', svg);
});
