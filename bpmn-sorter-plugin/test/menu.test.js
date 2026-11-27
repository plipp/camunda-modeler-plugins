import { createRequire } from 'node:module';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const menu = createRequire(import.meta.url)('../menu.js');

function setup(tabType = 'bpmn', mainWindow = {}) {
  const userData = mkdtempSync(join(tmpdir(), 'sorter-'));
  const emit = vi.fn();
  const app = { getPath: () => userData, emit, mainWindow };
  const state = { activeTab: { type: tabType } };
  return { app, emit, state, entries: () => menu(app, state) };
}

describe('menu.js', () => {
  let t;
  beforeEach(() => (t = setup()));

  it('shows ON by default and syncs the client', () => {
    const [entry] = t.entries();
    expect(entry.label).toContain('ON');
    expect(t.emit).toHaveBeenCalledWith(
      'menu:action',
      'toggle-bpmn-xml-sorting',
      { enabled: true }
    );
  });

  it('toggling persists, notifies the client and flips the label', () => {
    t.entries()[0].action();
    expect(t.emit).toHaveBeenCalledWith(
      'menu:action',
      'toggle-bpmn-xml-sorting',
      { enabled: false }
    );
    expect(t.emit).toHaveBeenCalledWith('menu:update', t.state);
    const [entry] = t.entries();
    expect(entry.label).toContain('OFF');
    entry.action();
    expect(t.entries()[0].label).toContain('ON');
  });

  it('does not sync without a window (would make Modeler reopen one)', () => {
    const closed = setup('bpmn', null);
    closed.entries();
    expect(closed.emit).not.toHaveBeenCalled();
  });

  it('is disabled and does not sync outside BPMN tabs', () => {
    const dmn = setup('dmn');
    const [entry] = dmn.entries();
    expect(entry.enabled).toBe(false);
    expect(dmn.emit).not.toHaveBeenCalled();
  });
});
