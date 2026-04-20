import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('swimlane diagram — hiring process, default palette', () => {
  const svg = fig({
    figure: 'swimlane',
    title: 'Hiring Process',
    subtitle: 'Candidate journey from application to offer',
    lanes: ['Candidate', 'HR', 'Hiring Manager'],
    nodes: [
      { id: 'apply',     label: 'Apply',           lane: 'Candidate'       },
      { id: 'screen',    label: 'Screen Resume',    lane: 'HR'              },
      { id: 'phone',     label: 'Phone Screen',     lane: 'HR'              },
      { id: 'interview', label: 'Technical Interview', lane: 'Hiring Manager' },
      { id: 'decision',  label: 'Hiring Decision',  lane: 'Hiring Manager'  },
      { id: 'offer',     label: 'Send Offer',        lane: 'HR'              },
    ],
    edges: [
      { from: 'apply',     to: 'screen' },
      { from: 'screen',    to: 'phone' },
      { from: 'phone',     to: 'interview' },
      { from: 'interview', to: 'decision' },
      { from: 'decision',  to: 'offer' },
    ],
    palette: 'default',
  });
  matchSvgSnapshot('swimlane-hiring-process-default', svg);
});
