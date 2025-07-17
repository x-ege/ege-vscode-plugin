/**
 * Author: wysaid
 * Date: 2023.12.12
 */

import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ege } from './ege';
import { copyDirRecursiveIfNotExist, copyIfNotExist } from './utils';

export function setupProject(internalTemplatePath: string = "project_with_libs") {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    for (const workspaceFolder of workspaceFolders || []) {
        /// 如果根目录没有 CMakeLists.txt, 拷贝一个过去
        const workspaceDir = workspaceFolder.uri.fsPath;
        const cmakeListsPath = vscode.Uri.file(`${workspaceDir}/CMakeLists.txt`);
        if (fs.existsSync(cmakeListsPath.fsPath)) {
            ege.printInfo("CMakeLists.txt 已存在!");
        } else {
            const cmakeListsTemplatePath = path.join(__dirname, `../cmake_template/${internalTemplatePath}/CMakeLists.txt`);
            fs.copyFileSync(cmakeListsTemplatePath, cmakeListsPath.fsPath);
            ege.printInfo("CMakeLists.txt 已创建!");

            /// 搜索一下项目目录下是否有别的 cpp 文件, 如果没有, 则拷贝 demo.cpp

            const files = fs.readdirSync(workspaceDir, { encoding: "utf-8" });
            let hasCppFile = false;
            for (const file of files) {
                if (file.endsWith(".cpp")) {
                    hasCppFile = true;
                    break;
                }
            }

            if (!hasCppFile) {
                /// 拷贝 demo.cpp
                copyIfNotExist(path.join(__dirname, `../cmake_template/${internalTemplatePath}/demo.cpp`), `${workspaceDir}/demo.cpp`);
            } else {
                ege.printInfo("项目目录下已存在 cpp 文件, 跳过创建 demo.cpp!");
            }
        }

        // 递归拷贝(不覆盖) cmake_template/project_with_libs/.vscode 目录下的所有内容到工作区根目录
        copyDirRecursiveIfNotExist(path.join(__dirname, `../cmake_template/${internalTemplatePath}/.vscode`), `${workspaceDir}/.vscode`);

        /// 如果根目录没有 ege 目录, 拷贝一个过去
        const egeDir = `${workspaceDir}/ege`;

        if (!fs.existsSync(egeDir)) {
            fs.mkdirpSync(egeDir);
            ege.printInfo("ege 目录已创建!");

            /// 拷贝整个 ege 目录
            const egeSrcDir = path.join(__dirname, "../bundle/ege_bundle");
            fs.copySync(egeSrcDir, egeDir);
        } else {
            ege.printInfo("ege 目录已存在, 跳过创建!");
        }
    }

    ege.getOutputChannel().show();
}