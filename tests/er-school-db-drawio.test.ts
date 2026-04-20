import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('ER diagram — school database, drawio palette', () => {
  const svg = fig({
    figure: 'er',
    title: 'School Database',
    subtitle: 'Students, courses and enrollment model',
    entities: [
      {
        id: 'Student',
        label: 'Student',
        accent: true,
        fields: [
          { name: 'id',       key: 'pk', type: 'uuid' },
          { name: 'name',                type: 'text' },
          { name: 'email',               type: 'text' },
        ],
      },
      {
        id: 'Teacher',
        label: 'Teacher',
        fields: [
          { name: 'id',   key: 'pk', type: 'uuid' },
          { name: 'name',            type: 'text' },
        ],
      },
      {
        id: 'Course',
        label: 'Course',
        fields: [
          { name: 'id',         key: 'pk', type: 'uuid' },
          { name: 'teacher_id', key: 'fk', type: 'uuid' },
          { name: 'name',                  type: 'text' },
          { name: 'credits',               type: 'int' },
        ],
      },
      {
        id: 'Enrollment',
        label: 'Enrollment',
        fields: [
          { name: 'student_id', key: 'fk', type: 'uuid' },
          { name: 'course_id',  key: 'fk', type: 'uuid' },
          { name: 'grade',                  type: 'text' },
        ],
      },
    ],
    relations: [
      { from: 'Teacher',    to: 'Course',     label: 'teaches',  fromCard: '1', toCard: 'N' },
      { from: 'Student',    to: 'Enrollment', label: 'enrolls',  fromCard: '1', toCard: 'N' },
      { from: 'Course',     to: 'Enrollment', label: 'contains', fromCard: '1', toCard: 'N' },
    ],
    palette: 'drawio',
  });
  matchSvgSnapshot('er-school-db-drawio', svg);
});
