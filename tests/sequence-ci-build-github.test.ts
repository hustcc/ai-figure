import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('sequence diagram — CI/CD build pipeline, github palette', () => {
  const svg = fig({
    figure: 'sequence',
    actors: ['Developer', 'GitHub', 'CI Runner', 'Registry', 'Cluster'],
    messages: [
      { from: 'Developer',  to: 'GitHub',     label: 'git push' },
      { from: 'GitHub',     to: 'CI Runner',  label: 'trigger workflow' },
      { from: 'CI Runner',  to: 'CI Runner',  label: 'npm test' },
      { from: 'CI Runner',  to: 'CI Runner',  label: 'docker build' },
      { from: 'CI Runner',  to: 'Registry',   label: 'docker push :sha' },
      { from: 'Registry',   to: 'CI Runner',  label: 'push ok',          style: 'return' },
      { from: 'CI Runner',  to: 'Cluster',    label: 'kubectl rollout' },
      { from: 'Cluster',    to: 'CI Runner',  label: 'rollout complete',  style: 'return' },
      { from: 'CI Runner',  to: 'GitHub',     label: 'status: success',   style: 'return' },
    ],
    palette: 'github',
  });
  matchSvgSnapshot('sequence-ci-build-github', svg);
});
