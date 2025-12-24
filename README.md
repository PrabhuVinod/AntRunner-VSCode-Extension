# Ant Runner - Build Target Executer

A VS Code extension that reads `build.xml` files and displays all runnable Ant targets in a tree view. Click on any target to execute it directly from VS Code.

## Installation

Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=PrabhuVinod.ant-target-runner) or search for "Ant Target Runner" in the Extensions view.

## Features

- **TreeView Display**: Shows all Ant targets from your build.xml file in a dedicated sidebar
- **One-Click Execution**: Click on any target to run it in an integrated terminal
- **Target Descriptions**: Displays target descriptions (if provided in build.xml)
- **Configurable Path**: Easy configuration of build.xml file location
- **Refresh Support**: Refresh the target list when build.xml changes

## Usage

1. Open the Ant Runner sidebar (look for the tools icon in the Activity Bar)
2. Click "Configure Build File Path" to select your build.xml file
3. The extension will display all available Ant targets
4. Click on any target to execute it
5. Use the refresh button to reload targets after modifying build.xml

## Configuration

The extension adds the following configuration option:

- `antRunner.buildFilePath`: Path to your build.xml file (can be absolute or relative to workspace)

You can configure this in Settings or by using the "Configure Build File Path" command.

## Requirements

- Apache Ant must be installed and available in your system PATH
- A valid build.xml file

## Example build.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project name="MyProject" default="build">
    <target name="clean" description="Clean build directory">
        <!-- cleanup tasks -->
    </target>
    <target name="build" description="Build the project">
        <!-- build tasks -->
    </target>
    <target name="test" description="Run tests">
        <!-- test tasks -->
    </target>
</project>
```

## Release Notes

### 0.0.1

Initial release:
- TreeView for Ant targets
- Click-to-execute functionality
- Build file configuration
- Target refresh support

