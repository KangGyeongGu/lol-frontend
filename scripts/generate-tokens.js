import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the tokens file (relative to project root based on user workspace)
// Workspace: /Users/kanggyeonggu/Desktop/lol-frontend
// Docs: ../../../Documents/league-of-algologic/02_DESIGN/TOKENS.json.md
const TOKENS_PATH = path.resolve(__dirname, '../../../Documents/league-of-algologic/02_DESIGN/TOKENS.json.md');
const OUTPUT_PATH = path.resolve(__dirname, '../src/styles/tokens.scss');

function parseTokens() {
    try {
        const content = fs.readFileSync(TOKENS_PATH, 'utf-8');
        // Extract JSON block
        const match = content.match(/```json\n([\s\S]*?)\n```/);
        if (!match) {
            console.error('Could not find JSON block in TOKENS.json.md');
            process.exit(1);
        }
        const tokens = JSON.parse(match[1]);
        return tokens;
    } catch (e) {
        console.error('Failed to read or parse tokens:', e);
        process.exit(1);
    }
}

function processTokens(obj, prefix = '-') {
    let css = '';
    for (const [key, value] of Object.entries(obj)) {
        const newPrefix = `${prefix}-${key}`;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            css += processTokens(value, newPrefix);
        } else {
            if (Array.isArray(value)) {
                css += `  ${newPrefix}: ${value.join(', ')};\n`;
            } else {
                css += `  ${newPrefix}: ${value};\n`;
            }
        }
    }
    return css;
}

const tokens = parseTokens();
const cssBody = processTokens(tokens);
const fileContent = `/* Generated from TOKENS.json.md - DO NOT EDIT */
:root {
${cssBody}
}
`;

fs.writeFileSync(OUTPUT_PATH, fileContent);
console.log(`Generated tokens.css at ${OUTPUT_PATH}`);
