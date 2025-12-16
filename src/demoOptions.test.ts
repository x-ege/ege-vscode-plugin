/**
 * Test file for demo options functionality
 */

import * as path from 'path';
import { DemoOptionsManager, DemoCategory } from './demoOptions';

// Test function to verify demo options functionality
export function testDemoOptions() {
    console.log('=== Testing demo options functionality ===');
    
    // Set the demos directory
    const demosDir = path.join(__dirname, '../cmake_template/ege_demos');
    DemoOptionsManager.setDemosDir(demosDir);
    
    // Test getting demo options in Chinese
    console.log('\n--- Testing Chinese demo options ---');
    const zhOptions = DemoOptionsManager.getDemoOptions('zh');
    console.log(`Total demos (Chinese): ${zhOptions.length}`);
    console.log('First 5 demos:');
    zhOptions.slice(0, 5).forEach(option => {
        console.log(`  - ${option.displayName}`);
        console.log(`    File: ${option.fileName || 'main.cpp'}`);
        console.log(`    Description: ${option.info?.description || 'N/A'}`);
        console.log(`    Category: ${option.info?.category || 'N/A'}`);
    });
    
    // Test getting demo options in English
    console.log('\n--- Testing English demo options ---');
    const enOptions = DemoOptionsManager.getDemoOptions('en');
    console.log(`Total demos (English): ${enOptions.length}`);
    console.log('First 5 demos:');
    enOptions.slice(0, 5).forEach(option => {
        console.log(`  - ${option.displayName}`);
        console.log(`    File: ${option.fileName || 'main.cpp'}`);
        console.log(`    Description: ${option.info?.description || 'N/A'}`);
        console.log(`    Category: ${option.info?.category || 'N/A'}`);
    });
    
    // Test getting demo options by category
    console.log('\n--- Testing demos by category ---');
    const categoryMap = DemoOptionsManager.getDemoOptionsByCategory('zh');
    console.log(`Number of categories: ${categoryMap.size}`);
    categoryMap.forEach((options, category) => {
        console.log(`  ${category}: ${options.length} demos`);
    });
    
    // Test specific categories
    console.log('\n--- Testing specific categories ---');
    const gameOptions = categoryMap.get(DemoCategory.GAME);
    if (gameOptions) {
        console.log(`Game demos (${gameOptions.length}):`);
        gameOptions.forEach(option => {
            console.log(`  - ${option.displayName}: ${option.info?.description}`);
        });
    }
    
    const graphicsOptions = categoryMap.get(DemoCategory.GRAPHICS);
    if (graphicsOptions) {
        console.log(`Graphics demos (${graphicsOptions.length}):`);
        graphicsOptions.forEach(option => {
            console.log(`  - ${option.displayName}: ${option.info?.description}`);
        });
    }
    
    console.log('=== End of demo options test ===');
}

// Export test function for manual testing
export { testDemoOptions as test };
