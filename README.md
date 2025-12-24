# Ant Runner - Build Target Executer

A powerful VS Code extension that seamlessly integrates Apache Ant build targets into your development workflow. Browse, search, and execute Ant targets directly from the VS Code sidebar with an intuitive tree view interface.

## Features

### 🎯 Interactive Target Tree View
- **Visual Target List**: All Ant targets from your build.xml displayed in a dedicated sidebar
- **Smart Icons**: Primary targets (with descriptions) marked with ⭐, secondary targets with ○
- **One-Click Navigation**: Click any target icon to jump to its definition in build.xml
- **Target Descriptions**: View target descriptions inline for better context

### 🚀 Flexible Execution
- **Single Click**: Select a target to view details
- **Double Click**: Execute the target immediately
- **Inline Run Button**: Click the ▶️ icon to run any target
- **Terminal Integration**: Commands execute in VS Code's integrated terminal
- **Space Handling**: Automatically handles target names with spaces (e.g., "all (Oracle-Dev)")

### 🔍 Smart Filtering & Search
- **Primary Target Filter**: Toggle between showing all targets or only primary targets (those with descriptions)
- **Real-time Search**: Search targets by name or description as you type
- **Clear Search**: Instantly reset search filters
- **Combined Filters**: Use primary filter and search simultaneously

### ⚙️ Easy Configuration
- **Build File Selector**: Quick file picker to select your build.xml
- **Workspace Support**: Handles both absolute and workspace-relative paths
- **Auto-refresh**: Manually refresh the target list when build.xml changes
- **Persistent Settings**: Configuration saved per workspace

## Installation

Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=PrabhuVinod.ant-target-runner) or search for "Ant Target Runner" in the Extensions view.

## Usage

### Initial Setup
1. Open the **Ant Runner** view in the sidebar (look for the ant icon 🐜)
2. Click **"Configure Build File Path"** in the toolbar
3. Select your `build.xml` file
4. Targets will automatically load and display

### Running Targets
- **Method 1**: Double-click any target to execute it
- **Method 2**: Click the ▶️ (run) icon next to a target
- **Method 3**: Single-click to select, then use the run command

### Viewing Target Source
- Click the 📄 (go-to-file) icon next to any target
- The build.xml file opens at the exact line where the target is defined

### Filtering Targets
- Click the 🔍 (filter) icon to toggle between:
  - **Primary targets only**: Shows targets with description attributes (user-facing targets)
  - **All targets**: Shows every target including helper/internal targets

### Searching Targets
1. Click the 🔍 (search) icon in the toolbar
2. Type your search query (searches both names and descriptions)
3. Press Enter to apply the filter
4. Click the ⨯ (clear) icon to remove the search filter

### Refreshing
- Click the 🔄 (refresh) icon to reload targets from build.xml
- Useful after modifying your build file

## Toolbar Reference

The Ant Runner view provides the following toolbar buttons:

| Icon | Command | Description |
|------|---------|-------------|
| 🔍 | Search Targets | Open search input to filter targets |
| ⨯ | Clear Search | Remove search filter |
| 🔄 | Refresh Targets | Reload targets from build.xml |
| 🔍 | Toggle Primary/All | Switch between primary and all targets |
| ⚙️ | Configure Build File | Select build.xml location |

## Requirements

- **Apache Ant** must be installed and available in your system PATH
- A valid `build.xml` file in your project

### Installing Apache Ant

**Windows:**
```powershell
choco install ant
```

**macOS:**
```bash
brew install ant
```

**Linux:**
```bash
sudo apt-get install ant  # Ubuntu/Debian
sudo yum install ant      # CentOS/RHEL
```

Verify installation:
```bash
ant -version
```

## Configuration

### Settings

The extension adds the following workspace setting:

- `antRunner.buildFilePath` - Path to your build.xml file (absolute or workspace-relative)

### Example build.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project name="MyProject" default="build">
    <!-- Primary targets (with descriptions) -->
    <target name="clean" description="Clean build directory">
        <delete dir="build"/>
    </target>
    
    <target name="build" description="Build the project">
        <mkdir dir="build"/>
        <javac srcdir="src" destdir="build"/>
    </target>
    
    <target name="test" description="Run tests">
        <junit printsummary="yes">
            <classpath>
                <pathelement path="build"/>
            </classpath>
        </junit>
    </target>
    
    <!-- Secondary targets (internal/helper) -->
    <target name="init">
        <mkdir dir="build"/>
    </target>
</project>
```

## Tips & Tricks

1. **Quick Access**: Primary targets (with descriptions) are shown by default when using the filter - these are typically the targets you'll run most often

2. **Keyboard Navigation**: Use arrow keys to navigate targets, Enter to run selected target

3. **Multiple Build Files**: Switch between different build.xml files using the Configure Build File command

4. **Search Shortcuts**: Search supports partial matching - type "build" to find all targets containing "build"

5. **Terminal History**: All executed Ant commands appear in VS Code's terminal history for reference

## Known Limitations

- Only one build.xml file can be active per workspace
- Targets spanning multiple lines may not parse correctly
- Complex target dependencies are not visualized (only shows direct depends attribute)

## Release Notes

### 0.0.1 (Initial Release)

- Tree view for Ant targets
- Single-click selection, double-click execution
- Inline run and open-in-editor buttons
- Primary/secondary target differentiation with icons
- Search and filter functionality
- Workspace-relative and absolute path support
- Space handling in target names
- Custom ant icon

## Contributing

Found a bug or have a feature request? Please file an issue on our [GitHub repository](https://github.com/PrabhuVinod/AntRunner-VSCode-Extension/issues).

## License

This extension is licensed under the [Apache-2.0 License](license.txt).

---

**Enjoy building with Ant!** 🐜
