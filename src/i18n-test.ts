/**
 * Simple test to verify i18n functionality
 * This can be run manually in the VS Code extension development environment
 */

import * as vscode from 'vscode';
import { t, i18n } from './i18n';

// Test the i18n functionality
export function testI18nFunctionality() {
    const outputChannel = vscode.window.createOutputChannel('EGE i18n Test');
    
    outputChannel.show();
    outputChannel.appendLine('=== EGE Extension i18n Test ===');
    outputChannel.appendLine(`VS Code Language: ${vscode.env.language}`);
    outputChannel.appendLine(`Current Language: ${i18n.getCurrentLanguage()}`);
    outputChannel.appendLine('');
    
    // Test command translations
    outputChannel.appendLine('Command Translations:');
    outputChannel.appendLine(`Setup Project: ${t('command.setupProject')}`);
    outputChannel.appendLine(`Setup Global: ${t('command.setupGlobal')}`);
    outputChannel.appendLine(`Build and Run: ${t('command.buildAndRunCurrentFile')}`);
    outputChannel.appendLine('');
    
    // Test message translations  
    outputChannel.appendLine('Message Translations:');
    outputChannel.appendLine(`Extension Activated: ${t('message.extensionActivated')}`);
    outputChannel.appendLine(`CMake Exists: ${t('message.cmakeListsExists')}`);
    outputChannel.appendLine(`Build Failed: ${t('message.buildFailed.noFileSelected')}`);
    outputChannel.appendLine('');
    
    // Test placeholder replacement
    outputChannel.appendLine('Placeholder Replacement:');
    outputChannel.appendLine(`Cache Dir Not Exist: ${t('message.cacheDirNotExist', '/test/cache/dir')}`);
    outputChannel.appendLine(`Platform Not Supported: ${t('message.platformNotSupported', 'test-platform')}`);
    outputChannel.appendLine(`Extraction Failed: ${t('message.extractionFailed', 'https://example.com/download', '/test/extract/path')}`);
    outputChannel.appendLine('');
    
    // Test button translations
    outputChannel.appendLine('Button Translations:');
    outputChannel.appendLine(`OK: ${t('button.ok')}`);
    outputChannel.appendLine(`Cancel: ${t('button.cancel')}`);
    outputChannel.appendLine(`Retry: ${t('button.retry')}`);
    outputChannel.appendLine('');
    
    outputChannel.appendLine('=== Test Complete ===');
    
    vscode.window.showInformationMessage(`i18n Test Complete! Language: ${i18n.getCurrentLanguage()}`);
}
