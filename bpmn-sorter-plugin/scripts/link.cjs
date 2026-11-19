#!/usr/bin/env node

/**
 * Development linking helper for BPMN XML Sorter Plugin
 * This script creates a symbolic link from the plugin directory to Camunda Modeler plugins directory
 * Based on the official Camunda Modeler plugin example development setup
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { PLUGIN_NAME, getCamundaPluginsDir } = require('./pluginsDir.cjs');

function createLink() {
  const pluginsDir = getCamundaPluginsDir();
  const targetPath = path.join(pluginsDir, PLUGIN_NAME);
  const sourcePath = path.resolve(__dirname, '..');
  const platform = os.platform();

  console.log('🔗 Setting up development link for BPMN XML Sorter Plugin...');
  console.log(`📂 Source: ${sourcePath}`);
  console.log(`🎯 Target: ${targetPath}`);
  console.log('');

  try {
    // Create plugins directory if it doesn't exist
    if (!fs.existsSync(pluginsDir)) {
      fs.mkdirSync(pluginsDir, { recursive: true });
      console.log('✅ Created plugins directory');
    }

    // Remove existing link/directory if it exists. lstat (not exists) so that
    // dangling links are detected too.
    let stats = null;
    try {
      stats = fs.lstatSync(targetPath);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (stats) {
      if (stats.isSymbolicLink()) {
        fs.unlinkSync(targetPath);
        console.log('✅ Removed existing symbolic link');
      } else {
        console.log(
          '⚠️  Warning: Directory already exists, you may need to remove it manually'
        );
        console.log(`   Path: ${targetPath}`);
        return;
      }
    }

    // 'junction' is only used on Windows (ignored elsewhere) and needs no admin rights.
    fs.symlinkSync(sourcePath, targetPath, 'junction');
    console.log('✅ Created symbolic link');
    printSuccessMessage();
  } catch (error) {
    console.error('❌ Failed to create symbolic link:', error.message);
    printManualInstructions(sourcePath, targetPath);
  }
}

function printSuccessMessage() {
  console.log('');
  console.log('🎉 Development link created successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Restart Camunda Modeler');
  console.log('2. Make changes to your plugin files');
  console.log('3. Reload Camunda Modeler:');
  console.log('   - Open Developer Tools (F12)');
  console.log('   - Press Ctrl+R (Windows/Linux) or Cmd+R (macOS) to reload');
  console.log('');
}

function printManualInstructions(sourcePath, targetPath) {
  const platform = os.platform();
  console.log('');
  console.log('Manual setup instructions:');
  console.log('');

  if (platform === 'win32') {
    console.log('Run this command in Command Prompt as Administrator:');
    console.log(`mklink /d "${targetPath}" "${sourcePath}"`);
  } else {
    console.log('Run this command in Terminal:');
    console.log(`ln -s "${sourcePath}" "${targetPath}"`);
  }
  console.log('');
}

// Check if script is run directly
if (require.main === module) {
  createLink();
}

module.exports = { createLink, getCamundaPluginsDir };
