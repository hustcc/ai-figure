/**
 * Parse tests for the ER diagram markdown syntax.
 *
 * Entities are declared with `section EntityName`.  Fields follow as
 * `name [pk|fk]: type` lines.  Relationships use the arrow syntax.
 *
 *   figure er
 *   title: Blog Schema
 *   section User
 *     id pk: uuid
 *     email: text
 *   section Post
 *     id pk: uuid
 *     author_id fk: uuid
 *   User --> Post: writes
 */
import { describe, it, expect } from 'vitest';
import { fig } from '../../src/index';

describe('er — markdown parse', () => {
  it('renders a basic ER diagram from string input', () => {
    const svg = fig(`
      figure er
      title: Blog Schema
      section User
        id pk: uuid
        email: text
      section Post
        id pk: uuid
        author_id fk: uuid
      User --> Post: writes
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Blog Schema');
    expect(svg).toContain('User');
    expect(svg).toContain('Post');
    expect(svg).toContain('email');
    expect(svg).toContain('writes');
  });

  it('config: title and subtitle', () => {
    const svg = fig(`
      figure er
      title: E-Commerce
      subtitle: Core entities
      section Product
        id pk: uuid
    `);
    expect(svg).toContain('E-Commerce');
    expect(svg).toContain('Core entities');
  });

  it('config: dark theme renders dark background', () => {
    const svg = fig(`
      figure er
      theme: dark
      section A
        id pk: uuid
    `);
    expect(svg).toContain('#1a1b1e');
  });

  it('config: palette antv', () => {
    const svg = fig(`
      figure er
      palette: antv
      section Entity
        id pk: uuid
    `);
    expect(svg).toContain('<svg');
  });

  it('accent: id marks an entity as accented', () => {
    const svg = fig(`
      figure er
      section User
        id pk: uuid
      accent: User
    `);
    expect(svg).toContain('<svg');
    expect(svg).toContain('User');
  });

  it('field with pk and fk designations', () => {
    const svg = fig(`
      figure er
      section Order
        id pk: uuid
        user_id fk: uuid
        total: decimal
    `);
    expect(svg).toContain('id');
    expect(svg).toContain('user_id');
    expect(svg).toContain('total');
  });

  it('title: inside a section is treated as a field, not meta', () => {
    // "title:" appears as a field type inside an entity — must not override diagram title
    const svg = fig(`
      figure er
      title: My Schema
      section Document
        name: text
        title: varchar
    `);
    expect(svg).toContain('My Schema'); // diagram title is set correctly
    expect(svg).toContain('Document');
  });

  it('relation without label', () => {
    const svg = fig(`
      figure er
      section A
        id pk: uuid
      section B
        id pk: uuid
      A --> B
    `);
    expect(svg).toContain('A');
    expect(svg).toContain('B');
  });

  it('multiple entities and multiple relations', () => {
    const svg = fig(`
      figure er
      section User
        id pk: uuid
      section Order
        id pk: uuid
        user_id fk: uuid
      section Item
        id pk: uuid
        order_id fk: uuid
      User --> Order: places
      Order --> Item: contains
    `);
    expect(svg).toContain('places');
    expect(svg).toContain('contains');
  });

  it('streaming safety: header-only returns valid SVG', () => {
    expect(() => fig('figure er')).not.toThrow();
    expect(fig('figure er')).toContain('<svg');
  });

  it('%% comment lines are ignored', () => {
    const svg = fig(`
      figure er
      %% user entity
      section User
        id pk: uuid
    `);
    expect(svg).toContain('User');
  });
});
