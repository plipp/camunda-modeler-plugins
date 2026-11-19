import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

/**
 * Sorts XML elements
 * @param {string} xmlString - The XML string to sort
 * @returns {string} - The sorted XML string
 */
export function sortXml(xmlString) {
  function normalized(xml) {
    // Self-close normalization must not touch CDATA sections or comments.
    return xml.replace(
      /<!\[CDATA\[[\s\S]*?\]\]>|<!--[\s\S]*?-->|([^>\s])\/>/g,
      (match, char) => (char === undefined ? match : `${char} />`)
    );
  }

  const doc = new DOMParser().parseFromString(xmlString, 'text/xml');
  sortElement(doc.documentElement);

  return normalized(new XMLSerializer().serializeToString(doc));
}

/**
 * Recursively sorts XML elements
 * @param {Element} element - The element to sort
 */
export function sortElement(element) {
  if (!element || !element.childNodes) return;

  // Cache existing child order so we can reinsert non-element nodes untouched.
  const originalChildren = Array.from(element.childNodes || []);
  if (!originalChildren.length) {
    return;
  }

  const sortableChildren = [];
  originalChildren.forEach((node, index) => {
    if (node.nodeType === 1) {
      sortElement(node);
      sortableChildren.push({
        node,
        metadata: serializeElement(node),
        originalIndex: index,
      });
    }
  });

  if (!sortableChildren.length) {
    return;
  }

  // Only element nodes participate in sorting; everything else keeps its slot.
  const sortedElements = sortableChildren
    .slice()
    .sort((a, b) => {
      const compareResult = sortXmlList(a.metadata, b.metadata);
      if (compareResult !== 0) {
        return compareResult;
      }

      return a.originalIndex - b.originalIndex;
    })
    .map((entry) => entry.node);

  let sortedIndex = 0;
  // Rebuild the child array, swapping in sorted elements while leaving other nodes as-is.
  const reorderedChildren = originalChildren.map((node) => {
    if (node.nodeType === 1) {
      return sortedElements[sortedIndex++];
    }

    return node;
  });

  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }

  // Append back the reordered children to finalize the stable mixed-content layout.
  reorderedChildren.forEach((node) => {
    element.appendChild(node);
  });
}

const BPMN_NAMESPACES = new Set([
  'http://www.omg.org/spec/BPMN/20100524/MODEL',
  'http://www.omg.org/spec/BPMN/20100524/DI',
  'http://www.omg.org/spec/DD/20100524/DC',
  'http://www.omg.org/spec/DD/20100524/DI',
]);

// Order mandated by the BPMN 2.0 / DI XSD sequences. Elements before '*' come first,
// everything not listed (flow elements, root elements, foreign namespaces) shares
// the '*' rank and is sorted by tag name / id.
const BPMN_ORDER = [
  'documentation',
  'extensionElements',
  'import',
  'extension',
  'incoming',
  'outgoing',
  'auditing',
  'monitoring',
  'ioSpecification',
  'property',
  'dataInput',
  'dataOutput',
  'dataInputAssociation',
  'dataOutputAssociation',
  'inputSet',
  'outputSet',
  'laneSet',
  'Bounds',
  'waypoint',
  'BPMNPlane',
  'interfaceRef',
  'endPointRef',
  'participantMultiplicity',
  'partitionElement',
  'flowNodeRef',
  'childLaneSet',
  'loopCardinality',
  'loopDataInputRef',
  'loopDataOutputRef',
  'inputDataItem',
  'outputDataItem',
  'complexBehaviorDefinition',
  '*',
  'participant',
  'messageFlow',
  'association',
  'group',
  'textAnnotation',
  'conversation',
  'callConversation',
  'subConversation',
  'conversationAssociation',
  'participantAssociation',
  'messageFlowAssociation',
  'correlationKey',
  'choreographyRef',
  'conversationLink',
  'BPMNDiagram',
  'relationship',
  'resourceRole',
  'performer',
  'humanPerformer',
  'potentialOwner',
  'correlationSubscription',
  'supports',
  'multiInstanceLoopCharacteristics',
  'standardLoopCharacteristics',
  'script',
  'rendering',
  'eventDefinition',
  'eventDefinitionRef',
  'BPMNLabel',
  'BPMNLabelStyle',
  'completionCondition',
];

const RANKS = new Map(BPMN_ORDER.map((name, index) => [name, index]));
const DEFAULT_RANK = RANKS.get('*');

// Order-free reference lists: body text is a safe, deterministic sort key.
const BODY_SORTED = new Set(['incoming', 'outgoing', 'flowNodeRef']);

function compareStrings(valueA, valueB) {
  if (valueA === valueB) return 0;
  return valueA < valueB ? -1 : 1;
}

function getRank(element) {
  if (!BPMN_NAMESPACES.has(element.namespaceURI)) {
    return DEFAULT_RANK;
  }
  const name = element.localName || '';
  const lookup = name.endsWith('EventDefinition') ? 'eventDefinition' : name;
  return RANKS.has(lookup) ? RANKS.get(lookup) : DEFAULT_RANK;
}

function sortXmlList(a, b) {
  if (!a || !a.element || !b || !b.element) {
    return 0;
  }

  if (a.rank !== b.rank) {
    return a.rank - b.rank;
  }

  let compareResult = compareStrings(a.tagName, b.tagName);
  if (compareResult !== 0) {
    return compareResult;
  }

  if (a.isExecutable !== b.isExecutable) {
    return a.isExecutable ? -1 : 1;
  }

  compareResult = compareStrings(a.id, b.id);
  if (compareResult !== 0) {
    return compareResult;
  }

  return compareStrings(a.body, b.body);
}

function serializeElement(element) {
  return {
    element,
    rank: getRank(element),
    tagName: element.tagName || '',
    isExecutable: element.getAttribute('isExecutable') === 'true',
    id: element.getAttribute('id') || '',
    body: BODY_SORTED.has(element.localName) ? getElementBody(element) : '',
  };
}

function getElementBody(element) {
  let buffer = '';
  for (let i = 0; i < element.childNodes.length; i++) {
    const node = element.childNodes[i];
    if ((node.nodeType === 3 || node.nodeType === 4) && node.nodeValue) {
      buffer += node.nodeValue;
    }
  }

  return buffer.trim();
}
