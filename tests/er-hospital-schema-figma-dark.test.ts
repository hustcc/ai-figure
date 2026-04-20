import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('ER diagram — hospital schema, figma palette dark', () => {
  const svg = fig({
    figure: 'er',
    title: 'Hospital Schema',
    subtitle: 'Patient, doctor and appointment model',
    theme: 'dark',
    entities: [
      {
        id: 'Patient',
        label: 'Patient',
        accent: true,
        fields: [
          { name: 'id',   key: 'pk', type: 'uuid' },
          { name: 'name',            type: 'text' },
          { name: 'dob',             type: 'date' },
        ],
      },
      {
        id: 'Doctor',
        label: 'Doctor',
        fields: [
          { name: 'id',         key: 'pk', type: 'uuid' },
          { name: 'dept_id',    key: 'fk', type: 'uuid' },
          { name: 'name',                  type: 'text' },
        ],
      },
      {
        id: 'Department',
        label: 'Department',
        fields: [
          { name: 'id',   key: 'pk', type: 'uuid' },
          { name: 'name',            type: 'text' },
        ],
      },
      {
        id: 'Appointment',
        label: 'Appointment',
        fields: [
          { name: 'id',         key: 'pk', type: 'uuid' },
          { name: 'patient_id', key: 'fk', type: 'uuid' },
          { name: 'doctor_id',  key: 'fk', type: 'uuid' },
          { name: 'date',                  type: 'datetime' },
        ],
      },
    ],
    relations: [
      { from: 'Department',   to: 'Doctor',      label: 'employs',  fromCard: '1', toCard: 'N' },
      { from: 'Patient',      to: 'Appointment',  label: 'books',    fromCard: '1', toCard: 'N' },
      { from: 'Doctor',       to: 'Appointment',  label: 'attends',  fromCard: '1', toCard: 'N' },
    ],
    palette: 'figma',
  });
  matchSvgSnapshot('er-hospital-schema-figma-dark', svg);
});
