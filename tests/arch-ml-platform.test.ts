import { it } from 'vitest';
import { createArchDiagram } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('arch diagram — ML platform, clean theme, TB direction', () => {
  const svg = createArchDiagram({
    layers: [
      {
        id: 'ingest', label: 'Data Ingestion',
        nodes: [
          { id: 'kafka',    label: 'Kafka' },
          { id: 'flink',    label: 'Flink' },
        ],
      },
      {
        id: 'store', label: 'Storage',
        nodes: [
          { id: 'hdfs',     label: 'HDFS' },
          { id: 'hive',     label: 'Hive' },
          { id: 'feature',  label: 'Feature Store' },
        ],
      },
      {
        id: 'train', label: 'Training',
        nodes: [
          { id: 'spark',    label: 'Spark' },
          { id: 'tf',       label: 'TensorFlow' },
          { id: 'pytorch',  label: 'PyTorch' },
        ],
      },
      {
        id: 'serve', label: 'Serving',
        nodes: [
          { id: 'triton',   label: 'Triton' },
          { id: 'seldon',   label: 'Seldon' },
        ],
      },
    ],
    theme: 'clean',
    direction: 'TB',
    width: 800,
  });
  matchSvgSnapshot('arch-ml-platform', svg);
});
