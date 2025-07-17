// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import vscode = require('vscode');
import fs = require('fs-extra');
import { EGEInstaller } from './installer';
import { buildCurrentActiveFile, unregisterSingleFileBuilder } from './buildSingleFile';

import utils = require('./utils')
import { ege } from './ege';
import { setupProject } from './setupProject';
import { t } from './i18n';

function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log(t('message.extensionActivated'));

	EGEInstaller.registerContext(context);

	context.subscriptions.push(vscode.commands.registerCommand('ege.setupProject', async () => {
		setupProject();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('ege.setupProjectWithEgeSrc', async () => {
		setupProject(true);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('ege.setupGlobal', () => {
		EGEInstaller.instance().performInstall();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('ege.buildAndRunCurrentFile', async (runPath?: vscode.Uri) => {
		/// Watch the file and trigger build when changed.
		let fileToRun = runPath?.fsPath;
		if (!fileToRun || !fs.existsSync(fileToRun)) {
			fileToRun = vscode.window.activeTextEditor?.document?.fileName;
			if (!fileToRun || !fs.existsSync(fileToRun)) {
				/// May focus tasks.
				const editors = vscode.window.visibleTextEditors;
				if (editors && editors.length > 0) {
					/// Choose the first editor.
					for (const e in editors) {
						const name = editors[e].document.fileName;
						if (fs.existsSync(name)) {
							fileToRun = name;
							break;
						}
					}
				}
			}
		}

		if (fileToRun && fs.existsSync(fileToRun)) {
			/// perform build and run

			const egeInstance = EGEInstaller.instance();
			if (egeInstance) {
				if (!utils.validateInstallationOfDirectory(egeInstance.egeInstallerDir)) {
					ege.showWarningBox(t('message.egeNotInitialized'), t('button.ok'));
					/// 没有执行过安装, 执行一次.
					egeInstance.egeDownloadedZipFile = undefined;
					if (await egeInstance.performInstall()) {
						await buildCurrentActiveFile(fileToRun);
					}

					if (!utils.validateInstallationOfDirectory(egeInstance.egeInstallerDir)) {
						ege.printError(t('message.extractionFailed', egeInstance.egeDownloadUrl, egeInstance.egeInstallerDir));
					} else {
						await buildCurrentActiveFile(fileToRun);
					}
				} else {
					await buildCurrentActiveFile(fileToRun);
				}
			}
		} else {
			if (fileToRun) {
				ege.showErrorBox(t('message.buildFailed.fileNotFound') + fileToRun);
			} else {
				ege.showErrorBox(t('message.buildFailed.noFileSelected'));
			}
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('ege.cleanupCaches', () => {
		EGEInstaller.instance().clearPluginCache();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('ege.openCacheDir', () => {
		if (EGEInstaller.instance().egeInstallerDir && fs.existsSync(EGEInstaller.instance().egeInstallerDir)) {
			utils.openDirectoryInFileExplorer(EGEInstaller.instance().egeInstallerDir);
		} else {
			vscode.window.showErrorMessage(t('message.cacheDirNotExist', EGEInstaller.instance().egeInstallerDir));
		}
	}));
}

// this method is called when your extension is deactivated
function deactivate() {
	/// cleanup
	EGEInstaller.unregister();
	unregisterSingleFileBuilder();
}

module.exports = {
	activate,
	deactivate
}
