import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('arch diagram — ML platform, accent palette, TB direction', () => {
  const svg = fig({
    figure: 'arch',
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
    palette: 'accent',
    direction: 'TB',
  });
  matchSvgSnapshot('arch-ml-platform-accent', svg);
});
