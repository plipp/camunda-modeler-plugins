#!/usr/bin/env node

/**
 * Installation helper for BPMN XML Sorter Plugin
 * This script helps copy the plugin files to the Camunda Modeler plugins directory
 */

const fs = require('fs');
const path = require('path');
const { PLUGIN_NAME, getCamundaPluginsDir } = require('./pluginsDir.cjs');

// Files that need to be copied (relative to project root)
const FILES_TO_COPY = [
  { source: 'index.js', target: 'index.js' },
  { source: 'dist/client.bundle.js', target: 'dist/client.bundle.js' },
  { source: 'package.json', target: 'package.json' },
];

function copyFiles() {
  const pluginsDir = getCamundaPluginsDir();
  const targetDir = path.join(pluginsDir, PLUGIN_NAME);
  const projectRoot = path.join(__dirname, '..');

  console.log('📁 Installing BPMN XML Sorter Plugin...');
  console.log(`🎯 Target directory: ${targetDir}`);

  try {
    // Create plugins directory if it doesn't exist
    if (!fs.existsSync(pluginsDir)) {
      fs.mkdirSync(pluginsDir, { recursive: true });
      console.log('✅ Created plugins directory');
    }

    // Create plugin directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log('✅ Created plugin directory');
    }

    // Fail before copying anything if a required file (e.g. the bundle) is missing
    FILES_TO_COPY.forEach(({ source }) => {
      if (!fs.existsSync(path.join(projectRoot, source))) {
        throw new Error(`${source} not found; run "npm run bundle" first`);
      }
    });

    FILES_TO_COPY.forEach(({ source, target }) => {
      const sourcePath = path.join(projectRoot, source);
      const targetPath = path.join(targetDir, target);

      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Copied ${source}`);
    });

    console.log('');
    console.log('🎉 Installation complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Restart Camunda Modeler');
    console.log('2. Open any BPMN file');
    console.log('3. Save the file (Ctrl+S) to see XML sorting in action');
    console.log('');
  } catch (error) {
    console.error('❌ Installation failed:', error.message);
    console.log('');
    console.log('Manual installation:');
    console.log(`1. Create directory: ${targetDir}`);
    console.log('2. Copy these files to the directory:');
    FILES_TO_COPY.forEach(({ source }) => console.log(`   - ${source}`));
    console.log('3. Restart Camunda Modeler');
    process.exit(1);
  }
}

// Check if script is run directly
if (require.main === module) {
  copyFiles();
}

module.exports = { copyFiles, getCamundaPluginsDir };
