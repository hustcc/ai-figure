import { it } from 'vitest';
import { createArchDiagram } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('arch diagram — data engineering pipeline, clean theme, LR direction', () => {
  const svg = createArchDiagram({
    layers: [
      {
        id: 'ingest', label: 'Ingestion',
        nodes: [
          { id: 'kafka',    label: 'Kafka' },
          { id: 'firehose', label: 'Firehose' },
        ],
      },
      {
        id: 'process', label: 'Processing',
        nodes: [
          { id: 'flink',  label: 'Flink' },
          { id: 'spark',  label: 'Spark' },
          { id: 'dbt',    label: 'dbt' },
        ],
      },
      {
        id: 'store', label: 'Storage',
        nodes: [
          { id: 's3',       label: 'S3 Data Lake' },
          { id: 'redshift', label: 'Redshift' },
          { id: 'iceberg',  label: 'Iceberg' },
        ],
      },
      {
        id: 'serve', label: 'Serving',
        nodes: [
          { id: 'superset', label: 'Superset' },
          { id: 'grafana',  label: 'Grafana' },
        ],
      },
    ],
    theme: 'clean',
    direction: 'LR',
    width: 700,
  });
  matchSvgSnapshot('arch-data-pipeline', svg);
});
