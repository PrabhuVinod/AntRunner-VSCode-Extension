// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser';

// Represents an Ant target
class AntTarget extends vscode.TreeItem {
	constructor(
		public readonly name: string,
		public readonly description: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly buildFilePath: string,
		public readonly lineNumber: number,
		public readonly depends: string
	) {
		super(name, collapsibleState);
		
		// Use TreeItemLabel for better visual distinction
		if (description && description.trim() !== '') {
			// Show name as label and description with separator for clarity
			this.label = name;
			this.description = `— ${description}`;
			this.tooltip = `${name}\n\n${description}`;
		} else {
			this.label = name;
			this.tooltip = name;
			this.description = '';
		}
		
		this.command = {
			command: 'ant-target-runner.handleClick',
			title: 'Handle Click',
			arguments: [this]
		};
		this.contextValue = 'antTarget';
		
		// Different icons for primary (with description) and secondary (without description) targets
		if (description && description.trim() !== '') {
			this.iconPath = new vscode.ThemeIcon('target');  // Primary target
		} else {
			this.iconPath = new vscode.ThemeIcon('circle-outline');  // Secondary target
		}
	}
}

// TreeDataProvider for Ant targets
class AntTargetsProvider implements vscode.TreeDataProvider<AntTarget> {
	private _onDidChangeTreeData: vscode.EventEmitter<AntTarget | undefined | null | void> = new vscode.EventEmitter<AntTarget | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<AntTarget | undefined | null | void> = this._onDidChangeTreeData.event;
	private showPrimaryOnly: boolean = false;
	private searchQuery: string = '';

	constructor() { }

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	togglePrimaryOnly(): void {
		this.showPrimaryOnly = !this.showPrimaryOnly;
		console.log(`Toggle filter: showPrimaryOnly = ${this.showPrimaryOnly}`);
		this.refresh();
	}

	getShowPrimaryOnly(): boolean {
		return this.showPrimaryOnly;
	}

	setSearchQuery(query: string): void {
		this.searchQuery = query.toLowerCase();
		this.refresh();
	}

	getSearchQuery(): string {
		return this.searchQuery;
	}

	clearSearch(): void {
		this.searchQuery = '';
		this.refresh();
	}

	getTreeItem(element: AntTarget): vscode.TreeItem {
		return element;
	}

	async getChildren(element?: AntTarget): Promise<AntTarget[]> {
		if (element) {
			return [];
		}

		const config = vscode.workspace.getConfiguration('antRunner');
		const buildFilePath = config.get<string>('buildFilePath');

		if (!buildFilePath) {
			vscode.window.showInformationMessage('Please configure the build.xml file path first.');
			return [];
		}

		// Resolve path relative to workspace or as absolute
		let resolvedPath = buildFilePath;
		if (!path.isAbsolute(buildFilePath)) {
			const workspaceFolders = vscode.workspace.workspaceFolders;
			if (workspaceFolders && workspaceFolders.length > 0) {
				resolvedPath = path.join(workspaceFolders[0].uri.fsPath, buildFilePath);
			}
		}

		if (!fs.existsSync(resolvedPath)) {
			vscode.window.showErrorMessage(`Build file not found: ${resolvedPath}`);
			return [];
		}

		try {
			const xmlContent = fs.readFileSync(resolvedPath, 'utf-8');
			let targets = this.parseTargets(xmlContent, resolvedPath);
			
			console.log(`Total targets parsed: ${targets.length}`);
			console.log(`showPrimaryOnly flag: ${this.showPrimaryOnly}`);
			
			// Filter to show only primary targets (targets with description) if flag is set
			if (this.showPrimaryOnly) {
				const primaryTargets = targets.filter(target => target.description && target.description.trim() !== '');
				console.log(`Primary targets (with description): ${primaryTargets.length}`);
				console.log(`Sample primary targets: ${primaryTargets.slice(0, 3).map(t => t.name).join(', ')}`);
				targets = primaryTargets;
			} else {
				console.log(`Showing all targets`);
			}
			
			// Apply search filter if query exists
			if (this.searchQuery && this.searchQuery.trim() !== '') {
				const query = this.searchQuery.toLowerCase();
				targets = targets.filter(target => 
					target.name.toLowerCase().includes(query) || 
					(target.description && target.description.toLowerCase().includes(query))
				);
				console.log(`Filtered by search '${this.searchQuery}': ${targets.length} targets`);
			}
			
			return targets;
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to read build.xml: ${error}`);
			return [];
		}
	}

	private parseTargets(xmlContent: string, buildFilePath: string): AntTarget[] {
		const targets: AntTarget[] = [];
		const lines = xmlContent.split('\n');

		// Find all target declarations with their line numbers
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			// More flexible regex to match target name
			const targetMatch = line.match(/<target\s+name="([^"]+)"/);
			
			if (targetMatch) {
				const name = targetMatch[1];
				const lineNumber = i + 1; // Line numbers are 1-based
				
				// Extract description attribute if present
				const descriptionMatch = line.match(/description="([^"]*)"/);
				const description = descriptionMatch ? descriptionMatch[1] : '';
				
				// Extract depends attribute if present
				const dependsMatch = line.match(/depends="([^"]*)"/);
				const depends = dependsMatch ? dependsMatch[1] : '';
				
				// Debug: log first few targets with description info
				if (targets.length < 5) {
					console.log(`Target: ${name}, description: '${description}'`);
				}
								targets.push(new AntTarget(
					name,
					description,
					vscode.TreeItemCollapsibleState.None,
					buildFilePath,
					lineNumber,
					depends
				));
			}
		}

		return targets;
	}
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Ant Target Runner extension is now active!');

	// Create the tree data provider
	const antTargetsProvider = new AntTargetsProvider();

	// Register the tree data provider
	vscode.window.registerTreeDataProvider('antTargets', antTargetsProvider);

	// Double-click detection state
	let lastClickTime = 0;
	let lastClickedTargetName = '';

	// Register click handler for double-click detection
	const handleClickCommand = vscode.commands.registerCommand('ant-target-runner.handleClick', async (target: AntTarget) => {
		const now = Date.now();
		
		// Check if this is a double-click (within 500ms on the same target)
		if (lastClickedTargetName === target.name && (now - lastClickTime) < 500) {
			// Double-click detected - run the target
			vscode.commands.executeCommand('ant-target-runner.runTarget', target.name);
			lastClickTime = 0; // Reset to prevent triple-click issues
			lastClickedTargetName = '';
		} else {
			// Single click - just update tracking (do nothing else)
			lastClickTime = now;
			lastClickedTargetName = target.name;
		}
	});

	// Register toggle primary targets command
	const togglePrimaryCommand = vscode.commands.registerCommand('ant-target-runner.togglePrimaryTargets', () => {
		antTargetsProvider.togglePrimaryOnly();
		const showingPrimary = antTargetsProvider.getShowPrimaryOnly();
		vscode.window.showInformationMessage(
			showingPrimary ? 'Showing primary targets only' : 'Showing all targets'
		);
	});

	// Register search targets command
	const searchCommand = vscode.commands.registerCommand('ant-target-runner.searchTargets', async () => {
		const currentQuery = antTargetsProvider.getSearchQuery();
		const query = await vscode.window.showInputBox({
			prompt: 'Search for Ant targets',
			placeHolder: 'Enter target name or description...',
			value: currentQuery
		});
		
		if (query !== undefined) {
			antTargetsProvider.setSearchQuery(query);
			if (query.trim() !== '') {
				vscode.window.showInformationMessage(`Searching for: ${query}`);
			}
		}
	});

	// Register clear search command
	const clearSearchCommand = vscode.commands.registerCommand('ant-target-runner.clearSearch', () => {
		antTargetsProvider.clearSearch();
		vscode.window.showInformationMessage('Search cleared');
	});

	// Register refresh command
	const refreshCommand = vscode.commands.registerCommand('ant-target-runner.refreshTargets', () => {
		antTargetsProvider.refresh();
	});

	// Register configure build file command
	const configureCommand = vscode.commands.registerCommand('ant-target-runner.configureBuildFile', async () => {
		const options: vscode.OpenDialogOptions = {
			canSelectMany: false,
			openLabel: 'Select build.xml',
			filters: {
				'XML files': ['xml']
			}
		};

		const fileUri = await vscode.window.showOpenDialog(options);
		if (fileUri && fileUri[0]) {
			const config = vscode.workspace.getConfiguration('antRunner');
			const workspaceFolders = vscode.workspace.workspaceFolders;
			
			let pathToSave = fileUri[0].fsPath;
			// Try to make it relative to workspace if possible
			if (workspaceFolders && workspaceFolders.length > 0) {
				const workspacePath = workspaceFolders[0].uri.fsPath;
				if (pathToSave.startsWith(workspacePath)) {
					pathToSave = path.relative(workspacePath, pathToSave);
				}
			}

			await config.update('buildFilePath', pathToSave, vscode.ConfigurationTarget.Workspace);
			vscode.window.showInformationMessage(`Build file configured: ${pathToSave}`);
			antTargetsProvider.refresh();
		}
	});

	// Register open target in editor command
	const openTargetCommand = vscode.commands.registerCommand('ant-target-runner.openTarget', async (target: AntTarget) => {
		if (!target || !target.buildFilePath || !target.lineNumber) {
			return;
		}

		try {
			const document = await vscode.workspace.openTextDocument(target.buildFilePath);
			const editor = await vscode.window.showTextDocument(document);
			
			// Navigate to the target line
			const position = new vscode.Position(target.lineNumber - 1, 0);
			editor.selection = new vscode.Selection(position, position);
			editor.revealRange(
				new vscode.Range(position, position),
				vscode.TextEditorRevealType.InCenter
			);
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to open file: ${error}`);
		}
	});

	// Register run target command
	const runTargetCommand = vscode.commands.registerCommand('ant-target-runner.runTarget', async (targetOrName: string | AntTarget) => {
		const targetName = typeof targetOrName === 'string' ? targetOrName : targetOrName.name;
		const config = vscode.workspace.getConfiguration('antRunner');
		const buildFilePath = config.get<string>('buildFilePath');

		if (!buildFilePath) {
			vscode.window.showErrorMessage('Build file path is not configured.');
			return;
		}

		// Resolve path
		let resolvedPath = buildFilePath;
		if (!path.isAbsolute(buildFilePath)) {
			const workspaceFolders = vscode.workspace.workspaceFolders;
			if (workspaceFolders && workspaceFolders.length > 0) {
				resolvedPath = path.join(workspaceFolders[0].uri.fsPath, buildFilePath);
			}
		}

		const buildDir = path.dirname(resolvedPath);

		// Create a new terminal and run ant
		const terminal = vscode.window.createTerminal({
			name: `Ant: ${targetName}`,
			cwd: buildDir
		});

		terminal.show();
		// Quote the target name to handle spaces
		const quotedTarget = targetName.includes(' ') ? `"${targetName}"` : targetName;
		terminal.sendText(`ant -buildfile "${path.basename(resolvedPath)}" ${quotedTarget}`);
	});

	context.subscriptions.push(handleClickCommand);
	context.subscriptions.push(togglePrimaryCommand);
	context.subscriptions.push(searchCommand);
	context.subscriptions.push(clearSearchCommand);
	context.subscriptions.push(refreshCommand);
	context.subscriptions.push(configureCommand);
	context.subscriptions.push(openTargetCommand);
	context.subscriptions.push(runTargetCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}

