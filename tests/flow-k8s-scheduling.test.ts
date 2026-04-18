import { it } from 'vitest';
import { createFlowChart } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('Kubernetes pod scheduling — clean theme, TB direction, 3 groups', () => {
  const svg = createFlowChart({
    nodes: [
      { id: 'pod', label: 'New Pod', type: 'terminal' },
      { id: 'apiserver', label: 'kube-apiserver', type: 'process' },
      { id: 'etcd', label: 'etcd (persist)', type: 'io' },
      { id: 'scheduler', label: 'kube-scheduler', type: 'process' },
      { id: 'filter', label: 'Filter Nodes', type: 'process' },
      { id: 'score', label: 'Score Nodes', type: 'process' },
      { id: 'best_node', label: 'Best Node Found?', type: 'decision' },
      { id: 'bind', label: 'Bind Pod → Node', type: 'process' },
      { id: 'kubelet', label: 'kubelet pulls image', type: 'process' },
      { id: 'running', label: 'Pod Running', type: 'terminal' },
      { id: 'pending', label: 'Pod Pending', type: 'terminal' },
    ],
    edges: [
      { from: 'pod', to: 'apiserver' },
      { from: 'apiserver', to: 'etcd' },
      { from: 'apiserver', to: 'scheduler' },
      { from: 'scheduler', to: 'filter' },
      { from: 'filter', to: 'score' },
      { from: 'score', to: 'best_node' },
      { from: 'best_node', to: 'bind', label: 'Yes' },
      { from: 'best_node', to: 'pending', label: 'No' },
      { from: 'bind', to: 'kubelet' },
      { from: 'kubelet', to: 'running' },
    ],
    groups: [
      { id: 'control', label: 'Control Plane', nodes: ['apiserver', 'etcd', 'scheduler'] },
      { id: 'sched', label: 'Scheduling', nodes: ['filter', 'score', 'best_node', 'bind'] },
      { id: 'node', label: 'Worker Node', nodes: ['kubelet', 'running'] },
    ],
    theme: 'clean',
    direction: 'TB',
  });
  matchSvgSnapshot('flow-k8s-scheduling', svg);
});
