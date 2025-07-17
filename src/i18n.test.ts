/**
 * Test file for i18n functionality
 */

import * as vscode from 'vscode';
import { t, i18n } from './i18n';

// Test function to verify i18n functionality
export function testI18n() {
    console.log('=== Testing i18n functionality ===');
    console.log('Current language:', i18n.getCurrentLanguage());
    console.log('VS Code language:', vscode.env.language);
    
    // Test some key translations
    console.log('Extension activated:', t('message.extensionActivated'));
    console.log('Setup project:', t('command.setupProject'));
    console.log('CMake exists:', t('message.cmakeListsExists'));
    console.log('Build failed:', t('message.buildFailed.noFileSelected'));
    console.log('Choose compiler:', t('title.chooseCompiler'));
    
    // Test placeholder replacement
    console.log('Cache dir not exist:', t('message.cacheDirNotExist', '/test/cache/dir'));
    console.log('Platform not supported:', t('message.platformNotSupported', 'test-platform'));
    console.log('Extraction failed:', t('message.extractionFailed', 'https://example.com/download', '/test/extract/path'));
    
    console.log('=== End of i18n test ===');
}

// Export test function for manual testing
export { testI18n as test };
