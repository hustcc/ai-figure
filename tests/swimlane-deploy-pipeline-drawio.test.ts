import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('swimlane diagram — CI/CD deploy pipeline, drawio palette', () => {
  const svg = fig({
    figure: 'swimlane',
    title: 'Deploy Pipeline',
    subtitle: 'Continuous delivery from commit to production',
    lanes: ['Developer', 'CI', 'Staging', 'Production'],
    nodes: [
      { id: 'commit',   label: 'Push Commit',      lane: 'Developer'   },
      { id: 'build',    label: 'Build & Test',      lane: 'CI'          },
      { id: 'image',    label: 'Build Image',       lane: 'CI'          },
      { id: 'deploy',   label: 'Deploy to Staging', lane: 'Staging'     },
      { id: 'qa',       label: 'QA Checks',         lane: 'Staging'     },
      { id: 'release',  label: 'Deploy to Prod',    lane: 'Production'  },
    ],
    edges: [
      { from: 'commit',  to: 'build' },
      { from: 'build',   to: 'image' },
      { from: 'image',   to: 'deploy' },
      { from: 'deploy',  to: 'qa' },
      { from: 'qa',      to: 'release' },
    ],
    palette: 'drawio',
  });
  matchSvgSnapshot('swimlane-deploy-pipeline-drawio', svg);
});
