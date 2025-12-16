/**
 * Author: wysaid
 * Date: 2023.12.12
 */

import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ege } from './ege';
import { copyDirRecursiveIfNotExist, copyIfNotExist } from './utils';
import { t, i18n } from './i18n';
import { DemoOptionsManager, DemoOption, DemoCategory, DemoCategoryDisplayNames } from './demoOptions';

export async function setupProject(usingSource?: boolean) {
    // Initialize demo options manager with the demos directory path
    DemoOptionsManager.setDemosDir(path.join(__dirname, '../cmake_template/ege_demos'));
    
    // Get current language
    const language = i18n.getCurrentLanguage();
    
    // Show demo selection dialog
    const demoOption = await showDemoSelectionDialog(language);
    if (!demoOption) {
        // User cancelled
        return;
    }
    const workspaceFolders = vscode.workspace.workspaceFolders;

    for (const workspaceFolder of workspaceFolders || []) {
        /// 如果根目录没有 CMakeLists.txt, 拷贝一个过去
        const workspaceDir = workspaceFolder.uri.fsPath;
        const cmakeListsPath = vscode.Uri.file(`${workspaceDir}/CMakeLists.txt`);
        if (fs.existsSync(cmakeListsPath.fsPath)) {
            ege.printInfo(t('message.cmakeListsExists'));
        } else {
            const cmakeListsTemplatePath = path.join(__dirname, `../cmake_template/${usingSource ? "CMakeLists_src.txt" : "CMakeLists_lib.txt"}`);
            fs.copyFileSync(cmakeListsTemplatePath, cmakeListsPath.fsPath);
            ege.printInfo(t('message.cmakeListsCreated'));

            /// 搜索一下项目目录下是否有别的 cpp 文件, 如果没有, 则拷贝 main.cpp

            const files = fs.readdirSync(workspaceDir, { encoding: "utf-8" });
            let hasCppFile = false;
            for (const file of files) {
                if (file.endsWith(".cpp")) {
                    hasCppFile = true;
                    break;
                }
            }

            if (!hasCppFile) {
                /// 拷贝选中的 demo 文件
                const sourceFile = demoOption.fileName 
                    ? path.join(__dirname, `../cmake_template/ege_demos/${demoOption.fileName}`)
                    : path.join(__dirname, `../cmake_template/main.cpp`);
                
                copyIfNotExist(sourceFile, `${workspaceDir}/main.cpp`);
                
                // If the demo requires image files, copy them too
                if (demoOption.fileName === 'graph_getimage.cpp') {
                    const demosDir = path.join(__dirname, '../cmake_template/ege_demos');
                    const imageFiles = ['getimage.jpg', 'getimage.png'];
                    imageFiles.forEach(imgFile => {
                        const imgPath = path.join(demosDir, imgFile);
                        if (fs.existsSync(imgPath)) {
                            copyIfNotExist(imgPath, `${workspaceDir}/${imgFile}`);
                        }
                    });
                }
            } else {
                ege.printInfo(t('message.skipCreateMainCpp'));
            }
        }

        // 递归拷贝(不覆盖) cmake_template/.vscode 目录下的所有内容到工作区根目录
        copyDirRecursiveIfNotExist(path.join(__dirname, `../cmake_template/.vscode`), `${workspaceDir}/.vscode`);

        /// 如果根目录没有 ege 目录, 拷贝一个过去
        const egeDir = `${workspaceDir}/ege`;

        if (!fs.existsSync(egeDir)) {
            fs.mkdirpSync(egeDir);
            ege.printInfo("ege 目录已创建!");

            if (usingSource) {
                const egeSrcDir = path.join(__dirname, "../bundle/ege_src");
                fs.copySync(egeSrcDir, egeDir);
            } else {
                /// 拷贝整个 ege 目录
                const egeLibDir = path.join(__dirname, "../bundle/ege_bundle");
                fs.copySync(egeLibDir, egeDir);
            }

        } else {
            ege.printInfo("ege 目录已存在, 跳过创建!");
        }
    }

    ege.getOutputChannel().show();
}

/**
 * Show demo selection dialog
 */
async function showDemoSelectionDialog(language: string): Promise<DemoOption | undefined> {
    const demoOptions = DemoOptionsManager.getDemoOptions(language);
    const categoryMap = DemoOptionsManager.getDemoOptionsByCategory(language);
    
    // Create QuickPick items grouped by category
    const items: (vscode.QuickPickItem & { demoOption: DemoOption })[] = [];
    
    // Sort categories in a meaningful order
    const categoryOrder = [
        DemoCategory.BASIC,
        DemoCategory.GRAPHICS,
        DemoCategory.GAME,
        DemoCategory.ALGORITHM,
        DemoCategory.PHYSICS,
        DemoCategory.FRACTAL,
        DemoCategory.IMAGE,
        DemoCategory.CAMERA
    ];
    
    const categoryDisplayNames = DemoCategoryDisplayNames[language] || DemoCategoryDisplayNames['zh'];
    
    categoryOrder.forEach(category => {
        const options = categoryMap.get(category);
        if (options && options.length > 0) {
            // Add empty separator between categories
            if (items.length > 0) {
                items.push({
                    label: '',
                    kind: vscode.QuickPickItemKind.Separator
                } as any);
            }
            
            // Add category label
            items.push({
                label: categoryDisplayNames[category],
                kind: vscode.QuickPickItemKind.Separator
            } as any);
            
            // Add demos in this category
            options.forEach(option => {
                items.push({
                    label: `$(file-code) ${option.displayName}`,
                    description: option.info?.description || '',
                    detail: option.fileName || 'main.cpp',
                    demoOption: option
                });
            });
        }
    });
    
    // Show QuickPick
    const selected = await vscode.window.showQuickPick(items.filter(item => item.kind !== vscode.QuickPickItemKind.Separator), {
        placeHolder: language === 'zh' ? '请选择一个示例模板' : 'Please select a demo template',
        matchOnDescription: true,
        matchOnDetail: true
    });
    
    return selected?.demoOption;
}