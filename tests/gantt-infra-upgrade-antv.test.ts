import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('gantt chart — infra upgrade, antv palette, LR-style monthly view', () => {
  const svg = fig({
    figure: 'gantt',
    title: 'Infrastructure Upgrade',
    subtitle: 'Cloud Migration H2 2025',
    tasks: [
      { id: 'assess',   label: 'Assessment',        start: '2025-07-01', end: '2025-07-25', groupId: 'phase1' },
      { id: 'poc',      label: 'PoC Setup',         start: '2025-07-14', end: '2025-08-08', groupId: 'phase1' },
      { id: 'network',  label: 'Network Config',    start: '2025-08-04', end: '2025-08-29', groupId: 'phase2' },
      { id: 'k8s',      label: 'K8s Cluster',       start: '2025-08-11', end: '2025-09-19', groupId: 'phase2' },
      { id: 'migrate',  label: 'Workload Migrate',  start: '2025-09-15', end: '2025-10-24', groupId: 'phase3' },
      { id: 'observe',  label: 'Observability',     start: '2025-09-29', end: '2025-10-31', groupId: 'phase3' },
      { id: 'cutover',  label: 'Traffic Cutover',   start: '2025-11-03', end: '2025-11-07' },
      { id: 'cleanup',  label: 'Legacy Cleanup',    start: '2025-11-10', end: '2025-11-28' },
    ],
    milestones: [
      { date: '2025-08-08', label: 'PoC sign-off' },
      { date: '2025-11-07', label: 'Migration complete' },
    ],
    palette: 'antv',
  });
  matchSvgSnapshot('gantt-infra-upgrade-antv', svg);
});
