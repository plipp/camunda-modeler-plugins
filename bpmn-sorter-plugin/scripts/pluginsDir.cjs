const path = require('path');
const os = require('os');

const PLUGIN_NAME = 'camunda-modeler-bpmn-xml-sorter';

// Get the Camunda Modeler plugins directory based on OS
function getCamundaPluginsDir() {
  const platform = os.platform();
  const homeDir = os.homedir();

  switch (platform) {
    case 'win32': {
      if (!process.env.APPDATA) {
        throw new Error('APPDATA is not set; cannot locate Camunda Modeler');
      }
      return path.join(
        process.env.APPDATA,
        'camunda-modeler',
        'resources',
        'plugins'
      );
    }
    case 'darwin':
      return path.join(
        homeDir,
        'Library',
        'Application Support',
        'camunda-modeler',
        'resources',
        'plugins'
      );
    default: {
      // linux: Electron honours XDG_CONFIG_HOME
      const configHome =
        process.env.XDG_CONFIG_HOME || path.join(homeDir, '.config');
      return path.join(configHome, 'camunda-modeler', 'resources', 'plugins');
    }
  }
}

module.exports = { PLUGIN_NAME, getCamundaPluginsDir };
