import { describe, it, expect } from 'vitest';
import { sortXml } from '../client/xmlSorter.js';

function normalizeXml(xml) {
  return xml
    .replace(/>\s+</g, '><')
    .replace(/>\s+/g, '>')
    .replace(/\s+</g, '<');
}

describe('sortXml', () => {
  describe('basic tests', () => {
    it('should sort XML elements alphabetically by tag name', () => {
      const input = `<root xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL">
  <bpmn:process id="Process_1">
    <bpmn:startEvent id="StartEvent_1"/>
    <bpmn:endEvent id="EndEvent_1"/>
  </bpmn:process>
</root>`;

      const expected = `<root xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"><bpmn:process id="Process_1"><bpmn:endEvent id="EndEvent_1" /><bpmn:startEvent id="StartEvent_1" /></bpmn:process></root>`;

      const result = sortXml(input);
      expect(normalizeXml(result)).toBe(expected);
    });

    it('should handle nested elements', () => {
      const input = `<root>
  <child2>
    <subchild2/>
    <subchild1/>
  </child2>
  <child1/>
</root>`;

      const expected = `<root><child1 /><child2><subchild1 /><subchild2 /></child2></root>`;

      const result = sortXml(input);
      expect(normalizeXml(result)).toBe(expected);
    });

    it('should sort elements by id when tag names are the same', () => {
      const input = `<root>
  <element id="b"/>
  <element id="a"/>
</root>`;

      const expected = `<root><element id="a" /><element id="b" /></root>`;

      const result = sortXml(input);
      expect(normalizeXml(result)).toBe(expected);
    });
  });

  describe('special cases', () => {
    it('should sort props', () => {
      const input = `<props:root xmlns:props="http://properties">
<props:attributes id="Attributes_1" />
<props:simpleBody />
<props:containedCollection />
</props:root>`;

      const result = sortXml(input);

      const expected =
        normalizeXml(`<props:root xmlns:props="http://properties">
<props:attributes id="Attributes_1" />
<props:containedCollection />
<props:simpleBody />
</props:root>`);
      expect(normalizeXml(result)).toBe(expected);
    });

    it('should sort mixed namespaces', () => {
      const input = `<ext:root xmlns:ext="http://extended" xmlns:props="http://properties">
<props:attributes id="Attributes_1" />
<props:attributes id="Attributes_2" />
<ext:extendedComplex numCount="100" />
<ext:base />
</ext:root>`;

      const expected =
        normalizeXml(`<ext:root xmlns:ext="http://extended" xmlns:props="http://properties">
<ext:base />
<ext:extendedComplex numCount="100" />
<props:attributes id="Attributes_1" />
<props:attributes id="Attributes_2" />
</ext:root>`);

      const result = sortXml(input);
      expect(normalizeXml(result)).toBe(expected);
    });

    it('should sort nesteds', () => {
      const input = `<e:root xmlns:e="http://extensions" xmlns:other="http://other">
<e:id>FOO</e:id>
<other:nestedMeta>
<other:meta key="k1" value="v1" />
<other:meta key="k2" value="v2" />
<other:additionalNote>
this is some text
</other:additionalNote>
</other:nestedMeta>
</e:root>`;

      const expected =
        normalizeXml(`<e:root xmlns:e="http://extensions" xmlns:other="http://other">
<e:id>FOO</e:id>
<other:nestedMeta>
<other:additionalNote>this is some text</other:additionalNote>
<other:meta key="k1" value="v1" />
<other:meta key="k2" value="v2" />
</other:nestedMeta>
</e:root>`);

      const result = sortXml(input);
      expect(normalizeXml(result)).toBe(expected);
    });

    it('should sort element lists', () => {
      const input = `<example1:parent xmlns:example1="http://example.org" xmlns:example2="http://example.com">
<example1:dTag />
<example1:cTag>c1Body</example1:cTag>
<example1:bTag id="b" />
<example1:cTag>c2Body</example1:cTag>
<example1:aTag id="a2" />
<example2:dTag />
<example1:aTag id="a1" />
</example1:parent>`;

      const expected =
        normalizeXml(`<example1:parent xmlns:example1="http://example.org" xmlns:example2="http://example.com">
<example1:aTag id="a1" />
<example1:aTag id="a2" />
<example1:bTag id="b" />
<example1:cTag>c1Body</example1:cTag>
<example1:cTag>c2Body</example1:cTag>
<example1:dTag />
<example2:dTag />
</example1:parent>`);

      const result = sortXml(input);
      expect(normalizeXml(result)).toBe(expected);
    });

    it('should sort element lists and put executable processes first', () => {
      const input = `<bpmn:parent xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL">
<bpmn:process id="Process_id1" />
<bpmn:process id="Process_id3" isExecutable="true" />
<bpmn:process id="Process_id2" isExecutable="false" />
</bpmn:parent>`;

      const expected =
        normalizeXml(`<bpmn:parent xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL">
<bpmn:process id="Process_id3" isExecutable="true" />
<bpmn:process id="Process_id1" />
<bpmn:process id="Process_id2" isExecutable="false" />
</bpmn:parent>`);

      const result = sortXml(input);
      expect(normalizeXml(result)).toBe(expected);
    });

    it('should keep sort order of listeners', () => {
      const input = `<bpmn:extensionElements xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL">
<camunda:executionListener expression="bbbbbbb" event="start" />
<camunda:executionListener expression="aaaaaa" event="start" />
</bpmn:extensionElements>`;

      const expected =
        normalizeXml(`<bpmn:extensionElements xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL">
<camunda:executionListener expression="bbbbbbb" event="start" />
<camunda:executionListener expression="aaaaaa" event="start" />
</bpmn:extensionElements>`);

      const result = sortXml(input);
      expect(normalizeXml(result)).toBe(expected);
    });

    it('should keep original order for identical listeners', () => {
      const input = `<bpmn:extensionElements xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL">
<camunda:executionListener event="start" />
<camunda:executionListener event="start" />
<camunda:executionListener event="start" />
</bpmn:extensionElements>`;

      // Sorting should not change the document even if the underlying JS engine uses an unstable sort.
      const result = sortXml(input);
      expect(result)
        .toBe(`<bpmn:extensionElements xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL">
<camunda:executionListener event="start" />
<camunda:executionListener event="start" />
<camunda:executionListener event="start" />
</bpmn:extensionElements>`);
    });

    it('should keep sort order of listeners - body or not', () => {
      const input = `<bpmn:extensionElements xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL">
<camunda:executionListener expression="bbbbbbb" event="start" />
<camunda:executionListener event="start">
<camunda:script scriptFormat="Groovy">print("Hello, World!");</camunda:script>
</camunda:executionListener>
</bpmn:extensionElements>`;

      const expected =
        normalizeXml(`<bpmn:extensionElements xmlns:camunda="http://camunda.org/schema/1.0/bpmn" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL">
<camunda:executionListener expression="bbbbbbb" event="start" />
<camunda:executionListener event="start">
<camunda:script scriptFormat="Groovy">print("Hello, World!");</camunda:script>
</camunda:executionListener>
</bpmn:extensionElements>`);

      const result = sortXml(input);
      expect(normalizeXml(result)).toBe(expected);
    });

    it('should retain namespace declarations on multiple branches', () => {
      const input = `<root>
  <branchA xmlns:foo="http://example.com/foo">
    <foo:item id="Item_1" />
  </branchA>
  <branchB xmlns:foo="http://example.com/foo">
    <foo:item id="Item_2" />
  </branchB>
</root>`;

      const expected = normalizeXml(`<root>
<branchA xmlns:foo="http://example.com/foo">
<foo:item id="Item_1" />
</branchA>
<branchB xmlns:foo="http://example.com/foo">
<foo:item id="Item_2" />
</branchB>
</root>`);

      const result = sortXml(input);
      const namespaceOccurrences =
        result.match(/xmlns:foo="http:\/\/example.com\/foo"/g) || [];

      expect(normalizeXml(result)).toBe(expected);
      expect(namespaceOccurrences).toHaveLength(2);
    });

    it('should preserve significant whitespace in attributes and text', () => {
      const input = `<root><child label="foo   bar">Hello   World</child></root>`;
      const result = sortXml(input);

      expect(result).toContain('label="foo   bar"');
      expect(result).toContain('Hello   World');
    });

    it('should keep text nodes in place when sorting siblings', () => {
      const input = `<root>before <b attr="2"/> between <a attr="1"/> after</root>`;
      const expected = `<root>before <a attr="1" /> between <b attr="2" /> after</root>`;

      const result = sortXml(input);
      expect(result).toBe(expected);
    });
  });

  describe('BPMN schema order and diff stability', () => {
    const NS = `xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:camunda="http://camunda.org/schema/1.0/bpmn"`;

    it('should keep incoming/outgoing before event definitions', () => {
      const input = `<bpmn:process ${NS} id="P"><bpmn:endEvent id="E"><bpmn:errorEventDefinition id="D" /><bpmn:outgoing>b</bpmn:outgoing><bpmn:incoming>a</bpmn:incoming></bpmn:endEvent></bpmn:process>`;
      const expected = `<bpmn:process ${NS} id="P"><bpmn:endEvent id="E"><bpmn:incoming>a</bpmn:incoming><bpmn:outgoing>b</bpmn:outgoing><bpmn:errorEventDefinition id="D" /></bpmn:endEvent></bpmn:process>`;
      expect(sortXml(input)).toBe(expected);
    });

    it('should keep conditionExpression after extensionElements', () => {
      const input = `<bpmn:sequenceFlow ${NS} id="F"><bpmn:conditionExpression>x</bpmn:conditionExpression><bpmn:extensionElements /></bpmn:sequenceFlow>`;
      const expected = `<bpmn:sequenceFlow ${NS} id="F"><bpmn:extensionElements /><bpmn:conditionExpression>x</bpmn:conditionExpression></bpmn:sequenceFlow>`;
      expect(sortXml(input)).toBe(expected);
    });

    it('should keep BPMNLabel after Bounds and waypoints in order', () => {
      const input = `<bpmndi:BPMNPlane ${NS}><bpmndi:BPMNShape id="S"><bpmndi:BPMNLabel><dc:Bounds x="1" /></bpmndi:BPMNLabel><dc:Bounds x="2" /></bpmndi:BPMNShape><bpmndi:BPMNEdge id="E"><bpmndi:BPMNLabel /><di:waypoint x="9" /><di:waypoint x="1" /></bpmndi:BPMNEdge></bpmndi:BPMNPlane>`;
      const expected = `<bpmndi:BPMNPlane ${NS}><bpmndi:BPMNEdge id="E"><di:waypoint x="9" /><di:waypoint x="1" /><bpmndi:BPMNLabel /></bpmndi:BPMNEdge><bpmndi:BPMNShape id="S"><dc:Bounds x="2" /><bpmndi:BPMNLabel><dc:Bounds x="1" /></bpmndi:BPMNLabel></bpmndi:BPMNShape></bpmndi:BPMNPlane>`;
      expect(sortXml(input)).toBe(expected);
    });

    it('should put process artifacts after flow elements and laneSet first', () => {
      const input = `<bpmn:process ${NS} id="P"><bpmn:association id="A" /><bpmn:task id="T" /><bpmn:laneSet id="L" /></bpmn:process>`;
      const expected = `<bpmn:process ${NS} id="P"><bpmn:laneSet id="L" /><bpmn:task id="T" /><bpmn:association id="A" /></bpmn:process>`;
      expect(sortXml(input)).toBe(expected);
    });

    it('should not alter CDATA or comment content', () => {
      const input = `<bpmn:script ${NS}><![CDATA[var html = "<br/>";]]></bpmn:script>`;
      expect(sortXml(input)).toBe(input);

      const withComment = `<root><!-- <x/> --></root>`;
      expect(sortXml(withComment)).toBe(withComment);
    });

    it('should keep order of order-sensitive lists', () => {
      const input = `<camunda:list ${NS}><camunda:value>b</camunda:value><camunda:value>a</camunda:value></camunda:list>`;
      expect(sortXml(input)).toBe(input);
    });

    it('should sort incoming/outgoing references by body', () => {
      const input = `<bpmn:task ${NS} id="T"><bpmn:incoming>b</bpmn:incoming><bpmn:incoming>a</bpmn:incoming></bpmn:task>`;
      const expected = `<bpmn:task ${NS} id="T"><bpmn:incoming>a</bpmn:incoming><bpmn:incoming>b</bpmn:incoming></bpmn:task>`;
      expect(sortXml(input)).toBe(expected);
    });

    it('should be idempotent and independent of input order', () => {
      const a = `<bpmn:process ${NS} id="P"><bpmn:task id="T1" /><bpmn:endEvent id="E"><bpmn:errorEventDefinition id="D" /><bpmn:incoming>f</bpmn:incoming></bpmn:endEvent><bpmn:sequenceFlow id="F" /></bpmn:process>`;
      const b = `<bpmn:process ${NS} id="P"><bpmn:sequenceFlow id="F" /><bpmn:endEvent id="E"><bpmn:incoming>f</bpmn:incoming><bpmn:errorEventDefinition id="D" /></bpmn:endEvent><bpmn:task id="T1" /></bpmn:process>`;
      const sortedA = sortXml(a);
      expect(sortXml(sortedA)).toBe(sortedA);
      expect(sortXml(b)).toBe(sortedA);
    });
  });
});
