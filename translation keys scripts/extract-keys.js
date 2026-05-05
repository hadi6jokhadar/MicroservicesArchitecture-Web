const fs = require('fs');
const path = require('path');

function findHtmlFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files.push(...findHtmlFiles(fullPath));
        } else if (item.isFile() && item.name.endsWith('.html')) {
            files.push(fullPath);
        }
    }
    return files;
}

function extractTranslationKeys() {
    const htmlFiles = findHtmlFiles('.');
    const keys = new Set();

    for (const file of htmlFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const matches = content.matchAll(/\{\{\s*'([^']+)'\s*\|\s*translate/g);
        for (const match of matches) {
            keys.add(match[1]);
        }
    }

    const sortedKeys = Array.from(keys).sort();
    fs.writeFileSync('used-translation-keys.json', JSON.stringify(sortedKeys, null, 2));
    console.log(`Extracted ${sortedKeys.length} unique translation keys and saved to used-translation-keys.json`);
}

extractTranslationKeys();