import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('swimlane diagram — expense approval, figma palette', () => {
  const svg = fig({
    figure: 'swimlane',
    title: 'Expense Approval',
    subtitle: 'Reimbursement workflow across departments',
    lanes: ['Employee', 'Manager', 'Finance'],
    nodes: [
      { id: 'submit',   label: 'Submit Expense',   lane: 'Employee' },
      { id: 'review',   label: 'Review Request',   lane: 'Manager'  },
      { id: 'approve',  label: 'Approve / Reject', lane: 'Manager'  },
      { id: 'audit',    label: 'Audit Claim',      lane: 'Finance'  },
      { id: 'pay',      label: 'Process Payment',  lane: 'Finance'  },
    ],
    edges: [
      { from: 'submit',  to: 'review' },
      { from: 'review',  to: 'approve' },
      { from: 'approve', to: 'audit' },
      { from: 'audit',   to: 'pay' },
    ],
    palette: 'figma',
  });
  matchSvgSnapshot('swimlane-expense-approval-figma', svg);
});
