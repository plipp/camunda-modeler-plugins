# BPMN XML Sorter Plugin

[![Compatible with Camunda Modeler version 2.2+](https://img.shields.io/badge/Modeler_Version-2.2+-blue.svg)](#) [![Plugin Type](https://img.shields.io/badge/Plugin_Type-BPMN-orange.svg)](#)

The Camunda Modeler does not keep the order of XML elements when saving any change. This makes the comparision
of model changes e.g. via `git diff` quite hard.

This Camunda Modeler plugin tries to overcome this flaw by automatically sorting BPMN XML elements when saving a model.

## Features

- **Automatic Sorting**: Sorts XML elements alphabetically by tag name, then by ID
- **Save Integration**: Runs automatically on every save (Ctrl+S)
- **Git-Friendly**: Produces consistent XML output for meaningful diffs
- **Non-Intrusive**: No visual changes to diagrams, only XML structure

## Installation

### Automated Installation

1. Download or clone this plugin
2. Run the installation script:
   ```bash
   npm install
   npm run install-plugin
   ```
3. Restart Camunda Modeler

### Manual Installation

1. Download or clone this plugin
2. Build the plugin:
   ```bash
   npm install
   npm run bundle
   ```
3. Create a plugin directory in your Camunda Modeler plugins folder:
   - **Windows**: `%APPDATA%/camunda-modeler/resources/plugins/camunda-modeler-bpmn-xml-sorter/`
   - **macOS**: `~/Library/Application Support/camunda-modeler/resources/plugins/camunda-modeler-bpmn-xml-sorter/`
   - **Linux**: `~/.config/camunda-modeler/resources/plugins/camunda-modeler-bpmn-xml-sorter/`

4. Copy these essential files to the plugin directory:
   - `index.js` (plugin entry point)
   - `dist/client.bundle.js` (bundled client code)
   - `package.json` (plugin metadata)

5. Restart Camunda Modeler

## Development Setup

Use [npm](https://www.npmjs.com/), the [Node.js](https://nodejs.org/en/) package manager to download and install required dependencies:

```bash
npm install
```

To make the Camunda Modeler aware of your plugin you must link the plugin to the [Camunda Modeler plugin directory](https://docs.camunda.io/docs/components/modeler/desktop-modeler/plugins/#plugging-into-camunda-modeler) via a symbolic link. Available utilities to do that are [mklink /d](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/mklink) on Windows and [ln -s](https://linux.die.net/man/1/ln) on MacOS / Linux.

Example commands:

**Windows:**

```cmd
mklink /d "%APPDATA%\camunda-modeler\resources\plugins\camunda-modeler-bpmn-xml-sorter" "%CD%"
```

**macOS / Linux:**

```bash
ln -s "$PWD" "$HOME/Library/Application Support/camunda-modeler/resources/plugins/camunda-modeler-bpmn-xml-sorter"
# or on Linux:
ln -s "$PWD" "$HOME/.config/camunda-modeler/resources/plugins/camunda-modeler-bpmn-xml-sorter"
```

Alternatively, use the provided linking script:

```bash
npm run link
```

Re-start the app in order to recognize the newly linked plugin.

## Usage

1. Open any BPMN file in Camunda Modeler
2. Make your changes
3. Save the file (Ctrl+S / Cmd+S)
4. The XML will be automatically sorted before saving

You can verify the sorting by checking Git diffs - elements and attributes will now appear in consistent alphabetical order.

## Development

### Development Workflow

- `npm run bundle` - Bundle the plugin for production
- `npm run bundle:watch` - Bundle in watch mode for development

Given you've setup and linked your plugin as explained above, you should be able to reload the modeler to pick up plugin changes. To do so, open the app's built-in development tools via `F12`. Then, within the development tools press the reload shortcuts `CTRL + R` or `CMD + R` to reload the app.

### Testing

- `npm test` - Run unit tests

### Code Quality

- `npm run format` - Format code with Prettier

### Project Structure

```
bpmn-js-plugin-example/
├── index.js             # Plugin entry point
├── package.json         # Dependencies and scripts
├── webpack.config.js    # Webpack configuration
├── .prettierrc.json     # Prettier configuration
├── .gitignore           # Git ignore rules
├── client/              # Client-side code
│   ├── client.js        # Plugin entry point
│   ├── xmlSorter.js     # XML sorting logic
│   └── XMLSorterPlugin.js # Plugin class
├── scripts/             # Development scripts
│   ├── install.cjs      # Installation script for production
│   └── link.cjs         # Linking script for development
├── test/                # Test files
│   └── xmlSorter.test.js # Unit tests
└── dist/                # Bundled output (generated)
    └── client.bundle.js
```

## Links

- [Camunda Modeler Plugin Documentation](https://docs.camunda.io/docs/components/modeler/desktop-modeler/plugins/)
- [Camunda Modeler Plugin Example](https://github.com/camunda/camunda-modeler-plugin-example)

## License

MIT
