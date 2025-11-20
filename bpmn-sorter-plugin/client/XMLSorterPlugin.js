import { sortXml } from './xmlSorter.js';

class XMLSorterPlugin {
  // `eventBus` will be injected through dependency injection
  constructor(eventBus) {
    eventBus.on('saveXML.serialized', function (event) {
      // Sort the XML
      console.log('saveXML.serialized: sortXml');
      return sortXml(event.xml);
    });
  }
}

// Use `$inject` to specify what modules should be injected
XMLSorterPlugin.$inject = ['eventBus'];

// Specify the module using a unique name
// Use __init__ to make sure an instance will be created
export default {
  __init__: ['xmlSorterPlugin'],
  xmlSorterPlugin: ['type', XMLSorterPlugin],
};
