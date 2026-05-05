const fs = require('fs');
const path = require('path');

// --- Configuration ---
const TARGET_DIR = '../'; // Set this to your application's source directory
const USED_KEYS_PATH = './used-translation-keys.json';
const OLD_EN_PATH = './old-en.json';
const NEW_EN_PATH = './en.json';

// 1. Load Data
const usedKeys = JSON.parse(fs.readFileSync(USED_KEYS_PATH, 'utf8'));
const oldEn = JSON.parse(fs.readFileSync(OLD_EN_PATH, 'utf8'));
const newEn = JSON.parse(fs.readFileSync(NEW_EN_PATH, 'utf8'));

// 2. Map new values back to their designated keys (prioritize 'common.' keys)
const newEnReverseMap = {};
for (const [key, value] of Object.entries(newEn)) {
  if (!newEnReverseMap[value] || key.startsWith('common.')) {
    newEnReverseMap[value] = key;
  }
}

// 3. Generate { oldKey: newKey } mapping for keys that need replacement
const replacements = {};
for (const oldKey of usedKeys) {
  // Skip if the key is retained exactly as is in the new en.json
  if (newEn[oldKey]) continue;

  const value = oldEn[oldKey];
  if (value && newEnReverseMap[value]) {
    replacements[oldKey] = newEnReverseMap[value];
  } else {
    console.warn(`[WARNING] No replacement found for key: "${oldKey}"`);
  }
}

// Sort replacements by length descending to prevent partial replacements
const sortedOldKeys = Object.keys(replacements).sort(
  (a, b) => b.length - a.length,
);
console.log(`Identified ${sortedOldKeys.length} keys requiring replacement.`);

// Escape string for regex insertion
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 4. File Processing Execution
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const oldKey of sortedOldKeys) {
    const newKey = replacements[oldKey];

    // Regex strictly matches the key surrounded by single quotes, double quotes, or backticks
    const regex = new RegExp(
      '([\'"`])' + escapeRegExp(oldKey) + '([\'"`])',
      'g',
    );

    if (regex.test(content)) {
      content = content.replace(regex, '$1' + newKey + '$2');
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[UPDATED] ${filePath}`);
  }
}

// 5. Directory Traversal
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  console.log('Processing directory:', dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Exclude build/dependency directories
      if (file !== 'node_modules' && file !== 'dist') {
        processDirectory(fullPath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.html')) {
      processFile(fullPath);
    }
  }
}

processDirectory(TARGET_DIR);
console.log('Replacement process completed.');
