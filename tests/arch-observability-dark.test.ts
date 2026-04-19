import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('arch diagram — observability stack, default palette, dark theme, LR direction', () => {
  const svg = fig({
    figure: 'arch',
    title: 'Observability Stack',
    layers: [
      {
        id: 'sources',
        label: 'Sources',
        nodes: [
          { id: 'app',      label: 'Application' },
          { id: 'infra',    label: 'Infrastructure' },
          { id: 'k8s',      label: 'Kubernetes' },
        ],
      },
      {
        id: 'collectors',
        label: 'Collectors',
        nodes: [
          { id: 'otel',     label: 'OpenTelemetry' },
          { id: 'prom',     label: 'Prometheus' },
          { id: 'fluentd',  label: 'Fluentd' },
        ],
      },
      {
        id: 'storage',
        label: 'Storage',
        nodes: [
          { id: 'tempo',    label: 'Tempo (Traces)' },
          { id: 'mimir',    label: 'Mimir (Metrics)' },
          { id: 'loki',     label: 'Loki (Logs)' },
        ],
      },
      {
        id: 'viz',
        label: 'Visualization',
        nodes: [
          { id: 'grafana',  label: 'Grafana' },
          { id: 'alertmgr', label: 'Alertmanager' },
        ],
      },
    ],
    theme: 'dark',
    palette: 'default',
    direction: 'LR',
  });
  matchSvgSnapshot('arch-observability-dark', svg);
});
