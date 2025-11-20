import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

/**
 * Sorts XML elements
 * @param {string} xmlString - The XML string to sort
 * @returns {string} - The sorted XML string
 */
export function sortXml(xmlString) {
  function normalized(xml) {
    return xml.replace(/([^>\s])\/>/g, '$1 />');
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

function localeCompare(valueA, valueB) {
  if (valueA) {
    return valueA.localeCompare(valueB || '');
  } else if (valueB) {
    return -1 * valueB.localeCompare(valueA || '');
  }
  return 0;
}

function sortXmlList(aElementSerializer, bElementSerializer) {
  if (
    !aElementSerializer ||
    !aElementSerializer.element ||
    !bElementSerializer ||
    !bElementSerializer.element
  ) {
    return 0;
  }

  let compareResult = localeCompare(
    aElementSerializer.tagName,
    bElementSerializer.tagName
  );
  if (compareResult !== 0) {
    return compareResult;
  }

  if (
    (aElementSerializer.isExecutable || bElementSerializer.isExecutable) &&
    aElementSerializer.isExecutable !== bElementSerializer.isExecutable
  ) {
    return aElementSerializer.isExecutable ? -1 : 1;
  }

  const relevantProps = ['id', '$body', 'body'];
  for (let propIndex = 0; propIndex < relevantProps.length; propIndex++) {
    const relevantProperty = relevantProps[propIndex];
    compareResult = localeCompare(
      aElementSerializer[relevantProperty],
      bElementSerializer[relevantProperty]
    );
    if (compareResult !== 0) {
      return compareResult;
    }
  }
  return 0;
}

function serializeElement(element) {
  return {
    element,
    tagName: element?.tagName || '',
    isExecutable: element?.getAttribute('isExecutable') === 'true',
    id: element?.getAttribute('id') || '',
    $body: element?.getAttribute('$body') || '',
    body: getElementBody(element),
  };
}

function getElementBody(element) {
  if (!element || !element.childNodes) {
    return '';
  }

  let buffer = '';
  for (let i = 0; i < element.childNodes.length; i++) {
    const node = element.childNodes[i];
    if (node.nodeType === 3 && node.nodeValue) {
      buffer += node.nodeValue;
    }
  }

  return buffer.trim();
}
