#!/usr/bin/env node

/**
 * generate-typst-resume.mjs — Typst .typ → PDF
 *
 * Usage:
 *   node generate-typst-resume.mjs <input.typ> <output.pdf> [--font-path=<path>]
 *
 * Requires: typst CLI installed (https://typst.app)
 * The input .typ file must import template.typ from attractive-typst-resume.
 */

import { execSync } from 'child_process';
import { resolve } from 'path';
import { existsSync } from 'fs';

const args = process.argv.slice(2);
let inputPath, outputPath, fontPath;

for (const arg of args) {
  if (arg.startsWith('--font-path=')) {
    fontPath = arg.split('=').slice(1).join('=');
  } else if (!inputPath) {
    inputPath = arg;
  } else if (!outputPath) {
    outputPath = arg;
  }
}

if (!inputPath || !outputPath) {
  console.error('Usage: node generate-typst-resume.mjs <input.typ> <output.pdf> [--font-path=<path>]');
  process.exit(1);
}

inputPath = resolve(inputPath);
outputPath = resolve(outputPath);

if (!existsSync(inputPath)) {
  console.error(`❌ Input file not found: ${inputPath}`);
  process.exit(1);
}

// Verify typst is available
try {
  execSync('typst --version', { stdio: 'pipe' });
} catch {
  console.error('❌ typst CLI not found. Install it from https://typst.app or via:');
  console.error('   brew install typst         (macOS)');
  console.error('   cargo install typst-cli    (any platform)');
  process.exit(1);
}

const fontArg = fontPath ? `--font-path "${resolve(fontPath)}"` : '';
const cmd = `typst compile ${fontArg} "${inputPath}" "${outputPath}"`;

console.log(`📄 Input:  ${inputPath}`);
console.log(`📁 Output: ${outputPath}`);
if (fontPath) console.log(`🔤 Fonts:  ${resolve(fontPath)}`);
console.log(`⚙️  Running: typst compile ...`);

try {
  execSync(cmd, { stdio: 'inherit' });
} catch {
  console.error('❌ Typst compilation failed.');
  process.exit(1);
}

// Report file size
import { statSync } from 'fs';
const size = statSync(outputPath).size;
console.log(`✅ PDF generated: ${outputPath}`);
console.log(`📦 Size: ${(size / 1024).toFixed(1)} KB`);
