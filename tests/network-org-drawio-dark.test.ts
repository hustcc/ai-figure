import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('network diagram — org chart, drawio palette dark', () => {
  const svg = fig({
    figure: 'network',
    title: '研发团队',
    subtitle: '组织关系',
    nodes: [
      { id: 'cto',     label: 'CTO',       group: 'Leadership', weight: 4 },
      { id: 'fe-lead', label: 'FE Lead',   group: 'Frontend',   weight: 3 },
      { id: 'be-lead', label: 'BE Lead',   group: 'Backend',    weight: 3 },
      { id: 'fe1',     label: 'FE Dev 1',  group: 'Frontend' },
      { id: 'fe2',     label: 'FE Dev 2',  group: 'Frontend' },
      { id: 'be1',     label: 'BE Dev 1',  group: 'Backend' },
      { id: 'be2',     label: 'BE Dev 2',  group: 'Backend' },
      { id: 'devops',  label: 'DevOps',    group: 'Infra',      weight: 2 },
    ],
    edges: [
      { from: 'cto',     to: 'fe-lead', label: '管理' },
      { from: 'cto',     to: 'be-lead', label: '管理' },
      { from: 'cto',     to: 'devops',  label: '管理' },
      { from: 'fe-lead', to: 'fe1' },
      { from: 'fe-lead', to: 'fe2' },
      { from: 'be-lead', to: 'be1' },
      { from: 'be-lead', to: 'be2' },
      { from: 'devops',  to: 'be1',    label: '协作' },
    ],
    theme: 'dark',
    palette: 'drawio',
  });
  matchSvgSnapshot('network-org-drawio-dark', svg);
});
