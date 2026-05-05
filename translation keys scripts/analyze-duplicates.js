const fs = require('fs');
const path = require('path');

function findDuplicateValues(enJson) {
    const valueToKeys = {};
    const duplicates = {};

    for (const [key, value] of Object.entries(enJson)) {
        if (!valueToKeys[value]) {
            valueToKeys[value] = [];
        }
        valueToKeys[value].push(key);
    }

    for (const [value, keys] of Object.entries(valueToKeys)) {
        if (keys.length > 1) {
            duplicates[value] = keys;
        }
    }

    return duplicates;
}

function analyzeDuplicates(duplicates, usedKeys) {
    const generalKeys = {};
    const uniqueKeys = new Set();

    for (const [value, keys] of Object.entries(duplicates)) {
        // Check if any key is in usedKeys
        const usedInKeys = keys.filter(key => usedKeys.includes(key));

        if (usedInKeys.length > 1) {
            // Multiple used keys with same value - potential for consolidation
            console.log(`Duplicate value: "${value}"`);
            console.log(`Used in keys: ${usedInKeys.join(', ')}`);
            console.log('---');

            // For now, assume the first one is general, others can be replaced
            const generalKey = usedInKeys[0];
            generalKeys[generalKey] = value;
            for (let i = 1; i < usedInKeys.length; i++) {
                // These can be replaced with generalKey
            }
        } else if (usedInKeys.length === 1) {
            // Only one used key, keep it unique
            uniqueKeys.add(usedInKeys[0]);
        }
    }

    return { generalKeys, uniqueKeys };
}

function main() {
    const enJsonPath = 'en.json';
    const usedKeysPath = 'used-translation-keys.json';

    const enJson = JSON.parse(fs.readFileSync(enJsonPath, 'utf8'));
    const usedKeys = JSON.parse(fs.readFileSync(usedKeysPath, 'utf8'));

    const duplicates = findDuplicateValues(enJson);
    console.log(`Found ${Object.keys(duplicates).length} duplicate values`);

    const { generalKeys, uniqueKeys } = analyzeDuplicates(duplicates, usedKeys);

    console.log('\nGeneral keys (can be shared):');
    for (const [key, value] of Object.entries(generalKeys)) {
        console.log(`${key}: "${value}"`);
    }

    console.log(`\nUnique keys: ${Array.from(uniqueKeys).length}`);
}

main();