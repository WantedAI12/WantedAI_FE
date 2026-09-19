import test from 'node:test';
import assert from 'node:assert/strict';
import { canRequestProjectDeletion, canUpdateProject } from '../lib/project-permissions.ts';

test('delete action is visible to solo members and team managers only', () => {
  assert.equal(canRequestProjectDeletion({ myRole: 'PERFUMER', memberCount: 1 }), true);
  assert.equal(canRequestProjectDeletion({ myRole: 'PERFUMER', memberCount: 2 }), false);
  assert.equal(canRequestProjectDeletion({ myRole: 'ORG_ADMIN', memberCount: 2 }), true);
  assert.equal(canRequestProjectDeletion({ myRole: 'PROJECT_MANAGER', memberCount: 2 }), true);
  assert.equal(canRequestProjectDeletion({ myRole: 'PERFUMER', memberCount: 0 }), false);
  assert.equal(canRequestProjectDeletion(null), false);
});

test('sole project members can edit regardless of role', () => {
  for (const myRole of ['PERFUMER', 'ORG_ADMIN', 'PROJECT_MANAGER', 'VIEWER']) {
    assert.equal(canUpdateProject({ myRole, memberCount: 1 }), true);
  }
});

test('multi-member projects require a management role', () => {
  assert.equal(canUpdateProject({ myRole: 'PERFUMER', memberCount: 2 }), false);
  assert.equal(canUpdateProject({ myRole: 'VIEWER', memberCount: 2 }), false);
  assert.equal(canUpdateProject({ myRole: 'ORG_ADMIN', memberCount: 2 }), true);
  assert.equal(canUpdateProject({ myRole: 'PROJECT_MANAGER', memberCount: 2 }), true);
  assert.equal(canUpdateProject(null), false);
  assert.equal(canUpdateProject(undefined), false);
  assert.equal(canUpdateProject({ myRole: 'PERFUMER', memberCount: 0 }), false);
});
