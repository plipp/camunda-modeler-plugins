'use strict';

const fs = require('fs');
const path = require('path');

// Runs in the Electron main process, which owns the on/off setting (single source of truth).
// The client keeps a localStorage cache and is re-synced on every menu rebuild.
module.exports = function (electronApp, menuState) {
  const stateFile = path.join(
    electronApp.getPath('userData'),
    'bpmn-xml-sorter-plugin.json'
  );

  let enabled = true;
  try {
    enabled = JSON.parse(fs.readFileSync(stateFile, 'utf8')).enabled !== false;
  } catch {
    // no or unreadable state file: default is on
  }

  const tabType = menuState.activeTab && menuState.activeTab.type;
  const isBpmnTab = tabType === 'bpmn' || tabType === 'cloud-bpmn';

  // The action is only registered inside BPMN tabs.
  if (isBpmnTab) {
    // Defer rebuild-time sync so menu rebuilding during quit cannot re-enter
    // the active tab and turn a close request into a reopen.
    queueMicrotask(() => {
      electronApp.emit('menu:action', 'toggle-bpmn-xml-sorting', { enabled });
    });
  }

  return [
    {
      label: enabled
        ? 'Sorting on Save: ON (click to disable)'
        : 'Sorting on Save: OFF (click to enable)',
      enabled: isBpmnTab,
      action: function () {
        const next = !enabled;
        fs.mkdirSync(path.dirname(stateFile), { recursive: true });
        fs.writeFileSync(stateFile, JSON.stringify({ enabled: next }), 'utf8');
        electronApp.emit('menu:action', 'toggle-bpmn-xml-sorting', {
          enabled: next,
        });
        electronApp.emit('menu:action', 'display-notification', {
          type: 'info',
          title: `BPMN XML sorting ${next ? 'enabled' : 'disabled'}`,
        });
        // rebuild the menu so the label shows the new state
        electronApp.emit('menu:update', menuState);
      },
    },
  ];
};
