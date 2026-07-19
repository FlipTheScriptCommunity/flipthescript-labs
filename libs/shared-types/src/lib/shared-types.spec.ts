import { describe, expect, it } from 'vitest';
import type { Course, User } from './shared-types.js';

describe('shared-types', () => {
  it('allows constructing a User', () => {
    const user: User = { id: '1', email: 'a@b.com', createdAt: '2026-01-01' };
    expect(user.id).toBe('1');
  });

  it('allows constructing a Course', () => {
    const course: Course = {
      id: '1',
      title: 'Intro',
      description: 'desc',
      createdAt: '2026-01-01',
    };
    expect(course.title).toBe('Intro');
  });
});
