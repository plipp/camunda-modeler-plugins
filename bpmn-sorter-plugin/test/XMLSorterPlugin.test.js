import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import XMLSorterModule, { TOGGLE_ACTION } from '../client/XMLSorterPlugin.js';
import { findIntegrityIssues, sortXml } from '../client/xmlSorter.js';

const NS = 'xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"';
const UNSORTED = `<bpmn:process ${NS} id="P"><bpmn:task id="B" /><bpmn:task id="A" /></bpmn:process>`;
const SORTED = `<bpmn:process ${NS} id="P"><bpmn:task id="A" /><bpmn:task id="B" /></bpmn:process>`;

function createPlugin() {
  let saveListener;
  const actions = {};
  const eventBus = {
    on: (event, fn) => event === 'saveXML.serialized' && (saveListener = fn),
  };
  const editorActions = { register: (name, fn) => (actions[name] = fn) };
  const Plugin = XMLSorterModule.xmlSorterPlugin[1];
  new Plugin(eventBus, editorActions);
  return {
    save: (xml) => saveListener({ xml }),
    toggle: (enabled) => actions[TOGGLE_ACTION]({ enabled }),
  };
}

describe('XMLSorterPlugin', () => {
  beforeEach(() => {
    const store = new Map();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (k) => store.get(k) ?? null,
        setItem: (k, v) => store.set(k, v),
      },
    });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('sorts on save by default', () => {
    expect(createPlugin().save(UNSORTED)).toBe(SORTED);
  });

  it('keeps the XML unsorted while disabled, and sorts again when re-enabled', () => {
    const plugin = createPlugin();
    plugin.toggle(false);
    expect(plugin.save(UNSORTED)).toBeUndefined();
    plugin.toggle(true);
    expect(plugin.save(UNSORTED)).toBe(SORTED);
  });

  it('fails open: unparsable XML is saved unchanged instead of failing the save', () => {
    expect(createPlugin().save('<broken')).toBeUndefined();
    expect(console.warn).toHaveBeenCalled();
  });

  it('warns about integrity issues but still sorts', () => {
    const xml = `<bpmn:process ${NS} id="P"><bpmn:task id="T" /><bpmn:task id="T" /></bpmn:process>`;
    expect(createPlugin().save(xml)).toBeTypeOf('string');
    expect(console.warn).toHaveBeenCalledWith(
      '[BPMN XML Sorter] duplicate id "T"'
    );
  });
});

describe('findIntegrityIssues', () => {
  it('reports duplicate ids and dangling references', () => {
    const xml = `<bpmn:definitions ${NS} id="D"><bpmn:process id="P"><bpmn:task id="T" /><bpmn:task id="T" /><bpmn:sequenceFlow id="F" sourceRef="T" targetRef="X" /></bpmn:process></bpmn:definitions>`;
    expect(findIntegrityIssues(xml)).toEqual([
      'duplicate id "T"',
      'bpmn:sequenceFlow targetRef="X" points to a missing id',
    ]);
  });

  it('finds nothing in a consistent model', () => {
    const fixture = readFileSync(
      new URL('./fixtures/approval-process.bpmn', import.meta.url),
      'utf8'
    );
    expect(findIntegrityIssues(fixture)).toEqual([]);
  });
});

describe('approval-process.bpmn fixture', () => {
  const fixture = readFileSync(
    new URL('./fixtures/approval-process.bpmn', import.meta.url),
    'utf8'
  );

  it('is idempotent and keeps every element', () => {
    const sorted = sortXml(fixture);
    const count = (xml) => (xml.match(/<[A-Za-z]/g) || []).length;
    expect(sortXml(sorted)).toBe(sorted);
    expect(count(sorted)).toBe(count(fixture));
  });
});
