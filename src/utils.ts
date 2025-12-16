/**
 * Author: wysaid
 * Date: 2022-1-23
 */

import cp = require('child_process');
import os = require('os');
import vscode = require('vscode');
import fs = require('fs-extra');
import path = require('path');
import { t } from './i18n';
import { ege } from './ege';
import iconv = require('iconv-lite')

const libsDirArray = [
    'graphics.lib',
    'amd64/graphics.lib',
    'amd64/graphics.lib',
    'x86/graphics.lib',
    'x64/graphics.lib',
];

export function openDirectoryInFileExplorer(dir: string) {
    const osName = os.platform();
    let openExplorerCommand = null;
    if (osName === 'win32' || osName === 'cygwin') { /// win
        openExplorerCommand = `explorer.exe "${dir}"`;
    } else if (osName === 'darwin') { /// mac
        openExplorerCommand = `open "${dir}"`;
    } else if (osName === 'linux') {
        openExplorerCommand = `xdg-open "${dir}"`;
    } else {
        vscode.window.showErrorMessage("EGE: " + t('message.openDirNotSupported', dir));
    }

    if (openExplorerCommand) {
        cp.exec(openExplorerCommand, (err) => {
            if (err)
                vscode.window.showInformationMessage("EGE: " + t('message.openDirFailed', dir, err.toString()));
        });
    }
}

export function validateInstallationOfDirectory(dir: string): boolean {

    /// Check `graphics.h`
    const graphicsHeaderPath = path.join(dir, 'include/graphics.h');
    const egeHeaderPath = path.join(dir, 'include/ege.h');

    if (fs.existsSync(graphicsHeaderPath) && fs.existsSync(egeHeaderPath)) {
        console.log("EGE: Find " + graphicsHeaderPath);
        console.log("EGE: Find " + egeHeaderPath);
    } else {
        console.error("EGE: No header at dir: " + dir);
        return false;
    }

    let findedLibs = new Array();

    libsDirArray.forEach(name => {
        let sdkLibDir = path.join(dir, 'lib');
        if (sdkLibDir.indexOf('wysaid.ege') !== -1 && sdkLibDir.indexOf('Install') !== -1) {
            /// The plugin temp directory, choose vs2019 to test.
            sdkLibDir = path.join(sdkLibDir, 'vs2019');
        }
        const libPath = path.join(sdkLibDir, name);
        if (fs.existsSync(libPath)) {
            findedLibs.push(libPath);
        }
    });

    if (findedLibs.length !== 0) {
        findedLibs.forEach(f => {
            console.log("EGE: Find lib file at: " + f);
        });
        return true;
    } else {
        console.error("EGE: EGE libraries not found at: " + dir);
        return false;
    }
}

export function isWindows(): boolean {
    return os.platform() === "win32";
}

export function isMacOS(): boolean {
    return os.platform() === "darwin";
}

export function isDebian(): boolean {
    return os.platform() === "linux" && fs.existsSync("/etc/debian_version");
}

export function whereis(name: string): string | null {
    try {
        const ret = cp.execSync((os.platform() === "win32" ? "where " : "which ") + name).toString()?.trim();
        if (ret && ret.length > 0) {
            if (isWindows()) {
                return ret.split('\r\n')[0];
            }
            return ret;
        }
    } catch (e) {
        console.log(e);
    }
    return null;
}

let supportWSL: number = -1;
export function hasWslSupport(): boolean {
    if (supportWSL < 0 && !isMacOS()) {
        /// 检查一下
        supportWSL = whereis("wsl.exe") ? 1 : 0;
    }
    return supportWSL === 1;
}

export type ShellResult = {
    exitCode: number;
    stdout: string | Buffer;
    stderr: string | Buffer;
};

export type RunShellOption = {
    cwd?: string | null;
    forceWsl?: boolean;
    useBuffer?: boolean;
    noErrorMsg?: boolean;
    useWindowsConsole?: boolean;
    useWindowsPowerShell?: boolean;
    /// 如果 `{!!printMsg}` 为 true, 则不会返回 stdout, stderr
    /// 如果 printMsg 为 'GBK', 表示在 windows 下强制使用 GBK 编码输出
    printMsg?: boolean | 'gbk';
    detach?: boolean;
};

type ShellRunnerInfo = {
    command: string;
    args?: string[];
    options: cp.SpawnSyncOptions | cp.CommonSpawnOptions;
};

function createShellRunnerInfo(command: string, args?: string[] | null, shellOption?: RunShellOption): null | ShellRunnerInfo | undefined {
    let result: ShellRunnerInfo | undefined;

    if (os.platform() === "darwin" || os.platform() === "linux" ||
        (os.platform() === "win32" && (hasWslSupport() || hasBashSupport))) {

        let shellCommand: string;

        if (isWindows() && (shellOption?.useWindowsConsole || shellOption?.useWindowsPowerShell)) {
            shellCommand = shellOption.useWindowsPowerShell ? "powershell" : "cmd";
        } else {
            if (hasBashSupport() && !(shellOption && shellOption.forceWsl)) {
                // windows 下优先找一下 git bash
                shellCommand = gitBashPath as string;
            } else if (hasWslSupport()) {
                shellCommand = 'wsl';
            } else {
                shellCommand = 'bash';
            }
        }

        let options: cp.SpawnSyncOptions = {
            encoding: shellOption?.useBuffer ? 'buffer' : 'utf8',
            shell: shellCommand
        };

        if (shellOption?.cwd) {
            options.cwd = shellOption.cwd;
        }

        if (shellOption?.detach) {
            const sp = cp.spawn(command, args as string[], {
                detached: true,
                shell: shellCommand,
                cwd: shellOption?.cwd as string
            });
            sp.unref();
            return null;
        }

        result = {
            command: command,
            args: args || undefined,
            options: options
        };

    } else {
        ege.showErrorBox(`暂时不支持的平台: ${os.platform()}`);
    }

    return result;
}

let supportGitBash: number = -1;
let gitBashPath: string | null = null;

// 仅支持windows, 找一下 git bash / mingw
export function hasBashSupport(): boolean {
    if (supportGitBash < 0 && isWindows()) {
        /// 检查一下
        try {
            const bashPaths = whereis("bash.exe") as string;
            gitBashPath = bashPaths?.split('\n')?.filter((v) => {
                return !(v.indexOf("System32") >= 0 || v.indexOf("Microsoft\\WindowsApps") >= 0);
            })?.[0]?.trim();

            if (!gitBashPath) {
                const gitPaths = whereis("git.exe") as string;
                let gitPath = gitPaths.split('\n')[0];
                gitPath = gitPath.trim();
                const gitDir = path.dirname(gitPath);

                /// 直接遍历 gitDir 往上找，一直到路径不包含 git 字样 位置.
                let gitInstallDir = gitDir;
                while (gitInstallDir.indexOf("Git") >= 0) {
                    const guessSuffix = ["bash.exe", "bin/bash.exe", "usr/bin/bash.exe", "mingw64/bin/bash.exe", "mingw32/bin/bash"];

                    for (const suffix of guessSuffix) {
                        let guessGitBashPath = path.join(gitInstallDir, suffix);

                        if (fs.existsSync(guessGitBashPath)) {
                            gitBashPath = guessGitBashPath;
                            break;
                        }
                    }

                    if (gitBashPath) {
                        break;
                    }
                    gitInstallDir = path.dirname(gitInstallDir);
                }
            }

            console.log("Bash find at " + gitBashPath);
            if (fs.existsSync(gitBashPath)) {
                supportGitBash = 1;
            } else {
                supportGitBash = 0;
            }
        } catch (e) {
            // 没有 wsl
            supportGitBash = 0;
        }
    }
    return supportGitBash === 1;
}

export function convertWindowsPathForShell(path: string, type?: "git-bash" | "wsl"): string {
    // 先把 \ 转为 /
    if (isWindows()) {
        path = path.replaceAll('\\', '/');
        if (!type) {
            if (hasBashSupport()) {
                type = "git-bash";
            } else if (hasWslSupport()) {
                type = "wsl";
            }
        }

        if (type === "git-bash") {
            path = path.replaceAll(/(\w):\/?/ig, "/$1/");
        } else if (type === "wsl") {
            path = path.replaceAll(/(\w):\/?/ig, "/mnt/$1/");
        }
    }
    return path;
}

function shouldConvertToGBK(shellOption?: RunShellOption): boolean {
    return shellOption?.printMsg === 'gbk' && isWindows();
}

export function runShellCommand(command: string, args?: string[] | null, shellOption?: RunShellOption): null | ShellResult {
    let result: ShellResult | null = null;

    try {
        const runInfo = createShellRunnerInfo(command, args, shellOption) as ShellRunnerInfo;

        if (!runInfo) {
            return null;
        }

        const sp = cp.spawnSync(runInfo.command, runInfo.args, runInfo.options);

        if (sp.error && !shellOption?.noErrorMsg) {
            console.error(`runShellCommand - ${sp.error} - ${arguments.toString()} - ${shellOption?.cwd}`);
        }

        if (shellOption?.printMsg) {
            if (sp.stdout && !shellOption.useBuffer) {
                if (shouldConvertToGBK(shellOption)) {
                    ege.printInfo(iconv.decode(sp.stdout as Buffer, 'gbk'));
                } else {
                    ege.printInfo(sp.stdout as string);
                }
            }
            if (sp.stderr) {
                if (shouldConvertToGBK(shellOption)) {
                    ege.printError(iconv.decode(sp.stderr as Buffer, 'gbk'));
                } else {
                    ege.printError(sp.stderr as string);
                }
            }
        }

        result = {
            stdout: sp.stdout,
            stderr: sp.stderr,
            exitCode: sp.status as number
        };
    } catch (e) {
        if (shellOption?.noErrorMsg) {
            console.log(arguments);
            console.error(`runShellCommand failed: ${e}`);
        }
    }

    return result;
}

export function asyncRunShellCommand(command: string, args?: string[] | null, shellOption?: RunShellOption): Promise<null | ShellResult> {
    return new Promise<null | ShellResult>((async (resolve) => {
        if (shellOption?.detach) {
            const ret = runShellCommand(command, args, shellOption);
            resolve(ret);
            return;
        }

        const runInfo = createShellRunnerInfo(command, args, shellOption) as ShellRunnerInfo;

        if (!runInfo) {
            resolve(null);
            return;
        }

        const sp = runInfo.args ? cp.spawn(runInfo.command, runInfo.args, runInfo.options) : cp.spawn(runInfo.command, runInfo.options);

        let stdout = "";
        let stderr = "";

        sp.stdout?.on('data', (data) => {
            if (shellOption?.printMsg) {
                if (shouldConvertToGBK(shellOption)) {
                    ege.printInfo(iconv.decode(data as Buffer, 'gbk'));
                } else {
                    ege.printInfo(data.toString());
                }
            } else {
                stdout += data.toString();
            }
        });

        sp.stderr?.on('data', (data) => {
            if (shellOption?.printMsg) {
                if (shouldConvertToGBK(shellOption)) {
                    ege.printError(iconv.decode(data as Buffer, 'gbk'));
                } else {
                    ege.printError(data.toString());
                }
            }
            stderr += data.toString();
        });

        sp.on('close', (code) => {
            resolve({
                stdout: stdout,
                stderr: stderr,
                exitCode: code as number
            });
        });

        sp.on('error', (err) => {
            ege.printError(`asyncRunShellCommand - ${err} - ${arguments.toString()} - ${shellOption?.cwd}`);
            resolve(null);
        });

        if (shellOption?.printMsg) {
            ege.printInfo(`执行命令: ${command} ${args ? args.join(' ') : ''}`);
        }
    }));
}

/**
 * Copy file if not exist. If exists, skip.
 */
export function copyIfNotExist(src: string, dst: string) {
    if (!fs.existsSync(dst)) {
        /// 如果中间目录不存在, 则创建
        const dstDir = path.dirname(dst);
        if (!fs.existsSync(dstDir)) {
            fs.mkdirpSync(dstDir);
        }
        fs.copyFileSync(src, dst);
        ege.printInfo(`${dst} 已创建!`);
    } else {
        ege.printInfo(`${dst} 已存在, 跳过创建!`);
    }
}

/**
 * Compare file contents
 */
function filesAreIdentical(file1: string, file2: string): boolean {
    try {
        const content1 = fs.readFileSync(file1);
        const content2 = fs.readFileSync(file2);
        return content1.equals(content2);
    } catch (e) {
        return false;
    }
}

/**
 * Copy file with user confirmation if content differs
 * @param src Source file path
 * @param dst Destination file path
 * @param overwriteAll If true, overwrite without prompting
 * @param skipAll If true, skip without prompting
 * @param workspaceDir Workspace directory for git stash (optional)
 * @returns 'copied' | 'skipped' | 'cancelled' | 'overwrite-all' | 'skip-all'
 */
export async function copyFileWithPrompt(
    src: string, 
    dst: string, 
    overwriteAll: boolean = false, 
    skipAll: boolean = false,
    workspaceDir?: string
): Promise<'copied' | 'skipped' | 'cancelled' | 'overwrite-all' | 'skip-all'> {
    if (!fs.existsSync(dst)) {
        /// 如果中间目录不存在, 则创建
        const dstDir = path.dirname(dst);
        if (!fs.existsSync(dstDir)) {
            fs.mkdirpSync(dstDir);
        }
        fs.copyFileSync(src, dst);
        ege.printInfo(`${dst} 已创建!`);
        return 'copied';
    }
    
    // File exists, check if content is identical
    if (filesAreIdentical(src, dst)) {
        ege.printInfo(t('message.fileContentSame', dst));
        return 'skipped';
    }
    
    // Content is different
    ege.printInfo(t('message.fileContentDifferent', dst));
    
    // If skip all is set, skip
    if (skipAll) {
        return 'skip-all';
    }
    
    // If overwrite all is set, overwrite
    if (overwriteAll) {
        // Stash if git-managed
        if (workspaceDir) {
            const relativePath = path.relative(workspaceDir, dst);
            if (relativePath && !relativePath.startsWith('..')) {
                await stashFilesIfGitManaged(workspaceDir, [relativePath]);
            }
        }
        fs.copyFileSync(src, dst);
        ege.printInfo(`${dst} 已覆盖!`);
        return 'overwrite-all';
    }
    
    // Ask user
    const choice = await vscode.window.showWarningMessage(
        t('prompt.overwriteFile', path.basename(dst)),
        { modal: true },
        t('button.yes'),
        t('button.no'),
        t('button.yesToAll'),
        t('button.noToAll')
    );
    
    if (choice === t('button.yes')) {
        // Stash if git-managed
        if (workspaceDir) {
            const relativePath = path.relative(workspaceDir, dst);
            if (relativePath && !relativePath.startsWith('..')) {
                await stashFilesIfGitManaged(workspaceDir, [relativePath]);
            }
        }
        fs.copyFileSync(src, dst);
        ege.printInfo(`${dst} 已覆盖!`);
        return 'copied';
    } else if (choice === t('button.yesToAll')) {
        // Stash if git-managed
        if (workspaceDir) {
            const relativePath = path.relative(workspaceDir, dst);
            if (relativePath && !relativePath.startsWith('..')) {
                await stashFilesIfGitManaged(workspaceDir, [relativePath]);
            }
        }
        fs.copyFileSync(src, dst);
        ege.printInfo(`${dst} 已覆盖!`);
        return 'overwrite-all';
    } else if (choice === t('button.noToAll')) {
        ege.printInfo(`${dst} 已跳过!`);
        return 'skip-all';
    } else if (choice === t('button.no')) {
        ege.printInfo(`${dst} 已跳过!`);
        return 'skipped';
    } else {
        // User cancelled
        return 'cancelled';
    }
}

/**
 * Copy directory recursively if not exist (old behavior, no prompts)
 */
export function copyDirRecursiveIfNotExist(srcDir: string, dstDir: string) {
    const files = fs.readdirSync(srcDir, { encoding: 'utf-8' });
    for (const file of files) {
        const srcPath = path.join(srcDir, file);
        const dstPath = path.join(dstDir, file);
        if (fs.statSync(srcPath).isDirectory()) {
            fs.ensureDirSync(dstPath);
            copyDirRecursiveIfNotExist(srcPath, dstPath);
        } else {
            copyIfNotExist(srcPath, dstPath);
        }
    }
}

/**
 * Copy directory recursively with user confirmation for each file
 * @param srcDir Source directory
 * @param dstDir Destination directory
 * @param overwriteAll Whether to overwrite all files without prompting (passed by reference via return value)
 * @param skipAll Whether to skip all files without prompting (passed by reference via return value)
 * @param workspaceDir Workspace directory for git stash (optional)
 * @returns Object with success status and updated flags: { success: boolean, overwriteAll: boolean, skipAll: boolean }
 */
export async function copyDirRecursiveWithPrompt(
    srcDir: string, 
    dstDir: string, 
    overwriteAll: boolean = false, 
    skipAll: boolean = false,
    workspaceDir?: string
): Promise<{ success: boolean, overwriteAll: boolean, skipAll: boolean }> {
    const files = fs.readdirSync(srcDir, { encoding: 'utf-8' });
    
    for (const file of files) {
        const srcPath = path.join(srcDir, file);
        const dstPath = path.join(dstDir, file);
        
        if (fs.statSync(srcPath).isDirectory()) {
            fs.ensureDirSync(dstPath);
            const result = await copyDirRecursiveWithPrompt(srcPath, dstPath, overwriteAll, skipAll, workspaceDir);
            if (!result.success) {
                return { success: false, overwriteAll, skipAll };
            }
            // Propagate the flags from recursive call
            overwriteAll = result.overwriteAll;
            skipAll = result.skipAll;
        } else {
            const result = await copyFileWithPrompt(srcPath, dstPath, overwriteAll, skipAll, workspaceDir);
            if (result === 'cancelled') {
                return { success: false, overwriteAll, skipAll };
            } else if (result === 'overwrite-all') {
                overwriteAll = true;
            } else if (result === 'skip-all') {
                skipAll = true;
            }
        }
    }
    
    return { success: true, overwriteAll, skipAll };
}

/**
 * Check if a directory is git-managed
 */
function isGitManaged(dir: string): boolean {
    try {
        // Check if git is available
        const gitPath = whereis('git');
        if (!gitPath) {
            return false;
        }
        
        // Check if directory is in a git repo
        const result = runShellCommand('git', ['rev-parse', '--git-dir'], { cwd: dir, noErrorMsg: true });
        return result !== null && result.exitCode === 0;
    } catch (e) {
        return false;
    }
}

/**
 * Stash files/directories before overwriting
 * @param workspaceDir The workspace directory
 * @param paths Paths relative to workspace to stash
 */
async function stashFilesIfGitManaged(workspaceDir: string, paths: string[]): Promise<void> {
    if (!isGitManaged(workspaceDir)) {
        return;
    }
    
    try {
        // Check if there are changes to stash
        const statusResult = runShellCommand('git', ['status', '--porcelain', ...paths], { cwd: workspaceDir, noErrorMsg: true });
        if (!statusResult || !statusResult.stdout || statusResult.stdout.toString().trim().length === 0) {
            // No changes to stash
            return;
        }
        
        // Create a stash with a descriptive message
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const stashMessage = `EGE Plugin: Auto-stash before overwrite (${timestamp})`;
        
        // Stage the files first
        for (const p of paths) {
            runShellCommand('git', ['add', p], { cwd: workspaceDir, noErrorMsg: true });
        }
        
        // Create the stash
        const stashResult = runShellCommand('git', ['stash', 'push', '-m', stashMessage, '--', ...paths], { cwd: workspaceDir, noErrorMsg: true });
        
        if (stashResult && stashResult.exitCode === 0) {
            ege.printInfo(`已使用 git stash 保存: ${paths.join(', ')}`);
        }
    } catch (e) {
        console.error('Failed to stash files:', e);
        // Don't fail the operation if stash fails
    }
}

/**
 * Replace entire directory with user confirmation
 * @param srcDir Source directory
 * @param dstDir Destination directory  
 * @param dirName Display name for the directory
 * @param overwriteAll If true, skip prompt and overwrite
 * @param workspaceDir Workspace directory for git stash (optional)
 * @returns true if operation succeeded or was skipped, false if cancelled
 */
export async function replaceDirWithPrompt(
    srcDir: string, 
    dstDir: string, 
    dirName: string, 
    overwriteAll: boolean = false,
    workspaceDir?: string
): Promise<boolean> {
    if (!fs.existsSync(dstDir)) {
        // Directory doesn't exist, just copy
        fs.ensureDirSync(dstDir);
        fs.copySync(srcDir, dstDir);
        ege.printInfo(`${dirName} 目录已创建!`);
        return true;
    }
    
    // Directory exists
    ege.printInfo(t('message.directoryExists', dirName));
    
    let shouldReplace = overwriteAll;
    
    if (!overwriteAll) {
        // Ask user
        const choice = await vscode.window.showWarningMessage(
            t('prompt.replaceDirectory', dirName),
            { modal: true },
            t('button.yes'),
            t('button.no')
        );
        
        if (choice === t('button.yes')) {
            shouldReplace = true;
        } else if (choice === t('button.no')) {
            ege.printInfo(`${dirName} 目录保持不变!`);
            return true;
        } else {
            // User cancelled
            return false;
        }
    }
    
    if (shouldReplace) {
        // Stash if git-managed
        if (workspaceDir) {
            const relativePath = path.relative(workspaceDir, dstDir);
            if (relativePath && !relativePath.startsWith('..')) {
                await stashFilesIfGitManaged(workspaceDir, [relativePath]);
            }
        }
        
        // Remove existing directory and copy
        fs.removeSync(dstDir);
        fs.ensureDirSync(dstDir);
        fs.copySync(srcDir, dstDir);
        ege.printInfo(`${dirName} 目录已替换!`);
        return true;
    }
    
    return true;
}
