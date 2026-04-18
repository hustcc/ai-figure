import { it } from 'vitest';
import { createFlowChart } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('data ETL pipeline — clean theme, TB direction, 3 groups', () => {
  const svg = createFlowChart({
    nodes: [
      { id: 'source_db', label: 'Source DB', type: 'io' },
      { id: 'source_api', label: 'REST API', type: 'io' },
      { id: 'source_files', label: 'CSV Files', type: 'io' },
      { id: 'extract', label: 'Extract', type: 'process' },
      { id: 'validate', label: 'Validate Schema', type: 'process' },
      { id: 'valid_check', label: 'Valid?', type: 'decision' },
      { id: 'dead_letter', label: 'Dead-Letter Queue', type: 'io' },
      { id: 'transform', label: 'Transform', type: 'process' },
      { id: 'enrich', label: 'Enrich Data', type: 'process' },
      { id: 'load', label: 'Load to DW', type: 'process' },
      { id: 'dw', label: 'Data Warehouse', type: 'terminal' },
    ],
    edges: [
      { from: 'source_db', to: 'extract' },
      { from: 'source_api', to: 'extract' },
      { from: 'source_files', to: 'extract' },
      { from: 'extract', to: 'validate' },
      { from: 'validate', to: 'valid_check' },
      { from: 'valid_check', to: 'transform', label: 'OK' },
      { from: 'valid_check', to: 'dead_letter', label: 'Bad' },
      { from: 'transform', to: 'enrich' },
      { from: 'enrich', to: 'load' },
      { from: 'load', to: 'dw' },
    ],
    groups: [
      { id: 'extract_grp', label: 'Extract', nodes: ['source_db', 'source_api', 'source_files', 'extract'] },
      { id: 'transform_grp', label: 'Transform', nodes: ['validate', 'transform', 'enrich'] },
      { id: 'load_grp', label: 'Load', nodes: ['load', 'dw'] },
    ],
    theme: 'clean',
    direction: 'TB',
  });
  matchSvgSnapshot('flow-etl-pipeline', svg);
});
