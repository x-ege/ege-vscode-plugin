/**
 * Author: wysaid
 * Date: 2025-07-17
 * Internationalization (i18n) support for EGE VSCode Extension
 */

import * as vscode from 'vscode';

// Language definitions
export interface LanguageStrings {
    // Command titles
    'command.setupProject': string;
    'command.setupProjectWithSource': string;
    'command.setupGlobal': string;
    'command.cleanupCaches': string;
    'command.openCacheDir': string;
    'command.buildAndRunCurrentFile': string;

    // Messages
    'message.extensionActivated': string;
    'message.cmakeListsExists': string;
    'message.cmakeListsCreated': string;
    'message.cppFileExists': string;
    'message.skipCreateMainCpp': string;
    'message.egeNotInitialized': string;
    'message.initializationComplete': string;
    'message.extractionFailed': string;
    'message.buildFailed.fileNotFound': string;
    'message.buildFailed.noFileSelected': string;
    'message.cacheDirNotExist': string;
    'message.compilerNotFound.windows': string;
    'message.compilerNotFound.other': string;
    'message.compilerChoose': string;
    'message.platformNotSupported': string;
    'message.lastJobNotFinished': string;
    'message.requestStart': string;
    'message.unrecognizedCompiler': string;
    'message.invalidDir': string;
    'message.notSupportedYet': string;
    'message.processCancelled': string;
    'message.openDirNotSupported': string;
    'message.openDirFailed': string;
    'message.builtinBundleNotFound': string;
    'message.getLatestVersionFailed': string;
    'message.installFinished': string;
    'message.noContentInInstallDir': string;
    'message.multiInstallDirFound': string;
    'message.cleanupCacheDone': string;
    'message.fileExists': string;
    'message.fileContentDifferent': string;
    'message.fileContentSame': string;
    'message.directoryExists': string;
    
    // Prompt messages
    'prompt.overwriteFile': string;
    'prompt.replaceDirectory': string;

    // Configuration descriptions
    'config.updateUrl.description': string;
    'config.showEditorContextMenu.description': string;
    'config.explorerContextMenu.description': string;

    // Buttons
    'button.ok': string;
    'button.cancel': string;
    'button.retry': string;
    'button.yes': string;
    'button.no': string;
    'button.yesToAll': string;
    'button.noToAll': string;

    // Titles
    'title.chooseCompiler': string;
    'title.egeConfiguration': string;
}

// English strings
const englishStrings: LanguageStrings = {
    // Command titles
    'command.setupProject': 'EGE: Setup ege project in current workspace',
    'command.setupProjectWithSource': 'EGE: Setup ege project with EGE source code in current workspace',
    'command.setupGlobal': 'EGE: Setup in global scope',
    'command.cleanupCaches': 'EGE: Cleanup caches',
    'command.openCacheDir': 'EGE: Open cache dir',
    'command.buildAndRunCurrentFile': 'EGE: Build and run current file',

    // Messages
    'message.extensionActivated': 'Congratulations, your extension "ege" is now active!',
    'message.cmakeListsExists': 'CMakeLists.txt already exists!',
    'message.cmakeListsCreated': 'CMakeLists.txt has been created!',
    'message.cppFileExists': 'C++ files already exist in the project directory, skipping main.cpp creation!',
    'message.skipCreateMainCpp': 'C++ files already exist in the project directory, skipping main.cpp creation!',
    'message.egeNotInitialized': 'EGE has not been initialized, initializing now. Please retry after initialization is complete...',
    'message.initializationComplete': 'Initialization complete, please retry...',
    'message.extractionFailed': 'Extraction failed!!! Please check your network connection, or manually download: {0} and extract to {1}',
    'message.buildFailed.fileNotFound': 'Build failed: File not found ',
    'message.buildFailed.noFileSelected': 'Build failed: No file selected!',
    'message.cacheDirNotExist': 'Cache dir {0} does not exist.',
    'message.compilerNotFound.windows': 'No supported compiler found! EGE VSCode plugin currently only supports Visual Studio (2017/2019/2022 or newer versions), please install and restart',
    'message.compilerNotFound.other': 'No supported compiler found! EGE VSCode plugin requires mingw-w64 support, please install and restart',
    'message.compilerChoose': 'Compiler chosen: ',
    'message.platformNotSupported': 'Platform {0} is not supported by now!',
    'message.lastJobNotFinished': 'Last job not finished, try to stop it...',
    'message.requestStart': 'start!',
    'message.unrecognizedCompiler': 'Unrecognized compiler {0}',
    'message.invalidDir': 'Invalid dir {0} or {1}',
    'message.notSupportedYet': 'Not supported by now! (Only Visual Studio is supported by now)',
    'message.processCancelled': 'process cancelled! Reason: {0}',
    'message.openDirNotSupported': 'Open dir is not supported on {0}',
    'message.openDirFailed': 'Open dir {0} failed: {1}',
    'message.builtinBundleNotFound': 'builtin bundle not found at: {0}',
    'message.getLatestVersionFailed': 'Failed to get the latest version of EGE. Are you offline?',
    'message.installFinished': 'Install finished!',
    'message.noContentInInstallDir': 'No content in the installation dir at: {0}',
    'message.multiInstallDirFound': 'Multi installation dir found, pick the first: {0}',
    'message.cleanupCacheDone': 'Cleanup ege plugin cache - Done!',
    'message.fileExists': 'File {0} already exists',
    'message.fileContentDifferent': 'File {0} content is different from template',
    'message.fileContentSame': 'File {0} content is identical to template, skipped',
    'message.directoryExists': 'Directory {0} already exists',
    
    // Prompt messages
    'prompt.overwriteFile': 'File {0} already exists and content is different. Overwrite?',
    'prompt.replaceDirectory': 'Directory {0} already exists. Replace entire directory?',

    // Configuration descriptions
    'config.updateUrl.description': 'An url to get latest version of EGE (default: https://xege.org/download/ege-latest-version)',
    'config.showEditorContextMenu.description': 'Show \'ege\' in editor context menu',
    'config.explorerContextMenu.description': 'Show \'ege\' in explorer context menu',

    // Buttons
    'button.ok': 'OK',
    'button.cancel': 'Cancel',
    'button.retry': 'Retry',
    'button.yes': 'Yes',
    'button.no': 'No',
    'button.yesToAll': 'Yes to All',
    'button.noToAll': 'No to All',

    // Titles
    'title.chooseCompiler': 'EGE: Choose the specific compiler to install.',
    'title.egeConfiguration': 'ege configuration',
};

// Chinese strings
const chineseStrings: LanguageStrings = {
    // Command titles
    'command.setupProject': 'EGE: 在当前工作区设置 ege 项目',
    'command.setupProjectWithSource': 'EGE: 在当前工作区设置带有 EGE 源代码的 ege 项目',
    'command.setupGlobal': 'EGE: 全局设置',
    'command.cleanupCaches': 'EGE: 清理缓存',
    'command.openCacheDir': 'EGE: 打开缓存目录',
    'command.buildAndRunCurrentFile': 'EGE: 构建并运行当前文件',

    // Messages
    'message.extensionActivated': '恭喜，您的 "ege" 扩展现在已激活！',
    'message.cmakeListsExists': 'CMakeLists.txt 已存在！',
    'message.cmakeListsCreated': 'CMakeLists.txt 已创建！',
    'message.cppFileExists': '项目目录下已存在 cpp 文件，跳过创建 main.cpp！',
    'message.skipCreateMainCpp': '项目目录下已存在 cpp 文件，跳过创建 main.cpp！',
    'message.egeNotInitialized': 'EGE没有初始化过，正在执行初始化，初始化完毕之后请重试...',
    'message.initializationComplete': '初始化完成，请重试...',
    'message.extractionFailed': '解压文件失败!!! 请检查网络连接，也可以手动下载: {0} 并解压到 {1}',
    'message.buildFailed.fileNotFound': '编译失败: 找不到文件 ',
    'message.buildFailed.noFileSelected': '编译失败: 未选中任何文件!',
    'message.cacheDirNotExist': '缓存目录 {0} 不存在。',
    'message.compilerNotFound.windows': '未找到可支持的编译器! ege vscode plugin 仅目前支持 Visual Studio (2017/2019/2022 或 更新版本)，请安装后重启',
    'message.compilerNotFound.other': '未找到可支持的编译器! ege vscode plugin 需要 mingw-w64 的支持，请安装后重启',
    'message.compilerChoose': '编译器选择: ',
    'message.platformNotSupported': '平台 {0} 目前不支持！',
    'message.lastJobNotFinished': '上一个任务未完成，尝试停止它...',
    'message.requestStart': '开始!',
    'message.unrecognizedCompiler': '无法识别的编译器 {0}',
    'message.invalidDir': '无效的目录 {0} 或 {1}',
    'message.notSupportedYet': '目前不支持！（目前仅支持 Visual Studio）',
    'message.processCancelled': '进程已取消！原因：{0}',
    'message.openDirNotSupported': '在 {0} 上不支持打开目录',
    'message.openDirFailed': '打开目录 {0} 失败：{1}',
    'message.builtinBundleNotFound': '在以下位置未找到内置包：{0}',
    'message.getLatestVersionFailed': '获取最新版本的 EGE 失败，您是否离线？',
    'message.installFinished': '安装完成！',
    'message.noContentInInstallDir': '在安装目录中没有内容：{0}',
    'message.multiInstallDirFound': '找到多个安装目录，选择第一个：{0}',
    'message.cleanupCacheDone': '清理 ege 插件缓存 - 完成！',
    'message.fileExists': '文件 {0} 已存在',
    'message.fileContentDifferent': '文件 {0} 的内容与模板不同',
    'message.fileContentSame': '文件 {0} 内容与模板相同，已跳过',
    'message.directoryExists': '目录 {0} 已存在',
    
    // Prompt messages
    'prompt.overwriteFile': '文件 {0} 已存在且内容不同，是否覆盖？',
    'prompt.replaceDirectory': '目录 {0} 已存在，是否替换整个目录？',

    // Configuration descriptions
    'config.updateUrl.description': '获取最新版本 EGE 的 URL（默认：https://xege.org/download/ege-latest-version）',
    'config.showEditorContextMenu.description': '在编辑器上下文菜单中显示 \'ege\'',
    'config.explorerContextMenu.description': '在资源管理器上下文菜单中显示 \'ege\'',

    // Buttons
    'button.ok': '确定',
    'button.cancel': '取消',
    'button.retry': '重试',
    'button.yes': '是',
    'button.no': '否',
    'button.yesToAll': '全部是',
    'button.noToAll': '全部否',

    // Titles
    'title.chooseCompiler': 'EGE: 选择要安装的特定编译器。',
    'title.egeConfiguration': 'ege 配置',
};

class I18n {
    private currentLanguage: string = 'en';
    private strings: LanguageStrings;

    constructor() {
        this.detectLanguage();
        this.strings = this.getStringsForLanguage(this.currentLanguage);
    }

    private detectLanguage(): void {
        // Get VS Code's display language
        const vscodeLanguage = vscode.env.language;
        
        // Check if it's Chinese (any variant)
        if (vscodeLanguage.startsWith('zh')) {
            this.currentLanguage = 'zh';
        } else {
            this.currentLanguage = 'en';
        }
    }

    private getStringsForLanguage(language: string): LanguageStrings {
        switch (language) {
            case 'zh':
                return chineseStrings;
            case 'en':
            default:
                return englishStrings;
        }
    }

    public t(key: keyof LanguageStrings, ...args: string[]): string {
        let message = this.strings[key] || key;
        
        // Simple placeholder replacement for {0}, {1}, etc.
        args.forEach((arg, index) => {
            message = message.replace(`{${index}}`, arg);
        });
        
        return message;
    }

    public getCurrentLanguage(): string {
        return this.currentLanguage;
    }
}

// Create singleton instance
const i18n = new I18n();

// Export the translation function
export function t(key: keyof LanguageStrings, ...args: string[]): string {
    return i18n.t(key, ...args);
}

// Export the i18n instance for advanced usage
export { i18n };
