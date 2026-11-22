import { findIntegrityIssues, sortXml } from './xmlSorter.js';

export const TOGGLE_ACTION = 'toggle-bpmn-xml-sorting';

// Cache of the setting owned by menu.js (main process), which re-sends it on every menu rebuild.
const SORTING_ENABLED_KEY = 'bpmn-xml-sorter.enabled';

function isSortingEnabled() {
  return window.localStorage.getItem(SORTING_ENABLED_KEY) !== 'false';
}

class XMLSorterPlugin {
  // `eventBus` and `editorActions` will be injected through dependency injection
  constructor(eventBus, editorActions) {
    editorActions.register(TOGGLE_ACTION, ({ enabled }) => {
      window.localStorage.setItem(SORTING_ENABLED_KEY, String(enabled));
    });

    eventBus.on('saveXML.serialized', function (event) {
      // Fail open: never let the sorter be the reason a save fails.
      try {
        findIntegrityIssues(event.xml).forEach((issue) =>
          console.warn(`[BPMN XML Sorter] ${issue}`)
        );

        if (isSortingEnabled()) {
          return sortXml(event.xml);
        }
      } catch (error) {
        console.warn(
          '[BPMN XML Sorter] sorting failed, saving unsorted XML',
          error
        );
      }
    });
  }
}

// Use `$inject` to specify what modules should be injected
XMLSorterPlugin.$inject = ['eventBus', 'editorActions'];

// Specify the module using a unique name
// Use __init__ to make sure an instance will be created
export default {
  __init__: ['xmlSorterPlugin'],
  xmlSorterPlugin: ['type', XMLSorterPlugin],
};
