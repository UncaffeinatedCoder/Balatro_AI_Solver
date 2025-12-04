#!/usr/bin/env node
/**
 * Installation Verification Script
 * Run this to ensure Balatro AI Assistant is properly installed
 */

console.log('\n🔍 Balatro AI Assistant - Installation Check\n');
console.log('═══════════════════════════════════════════════\n');

const fs = require('fs');
const path = require('path');

let allGood = true;

// Check 1: Node.js version
console.log('1. Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion >= 18) {
  console.log(`   ✅ Node.js ${nodeVersion} (requires 18+)\n`);
} else {
  console.log(`   ❌ Node.js ${nodeVersion} is too old (requires 18+)\n`);
  allGood = false;
}

// Check 2: Required files
console.log('2. Checking required files...');
const requiredFiles = [
  'src/scoring-engine.js',
  'src/recommendation-engine.js',
  'src/demo.js',
  'src/main.js',
  'package.json',
  'README.md'
];

let missingFiles = [];
for (const file of requiredFiles) {
  if (fs.existsSync(path.join(__dirname, '..', file))) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} (missing)`);
    missingFiles.push(file);
    allGood = false;
  }
}
console.log('');

// Check 3: Dependencies
console.log('3. Checking dependencies...');
try {
  require('sharp');
  console.log('   ✅ sharp (image processing)');
} catch (e) {
  console.log('   ❌ sharp (run: npm install sharp)');
  allGood = false;
}

try {
  require('screenshot-desktop');
  console.log('   ✅ screenshot-desktop (screen capture)');
} catch (e) {
  console.log('   ❌ screenshot-desktop (run: npm install screenshot-desktop)');
  allGood = false;
}
console.log('');

// Check 4: Core functionality
console.log('4. Testing core functionality...');
try {
  const { Card, ScoringEngine } = require('../src/scoring-engine');
  const engine = new ScoringEngine();
  const testHand = [
    new Card('K', '♠'),
    new Card('K', '♥'),
    new Card('7', '♦'),
    new Card('3', '♣'),
    new Card('2', '♠')
  ];
  const result = engine.calculateScore(testHand);
  if (result.score === 84 && result.handType === 'Pair') {
    console.log('   ✅ Scoring engine works correctly');
  } else {
    console.log('   ❌ Scoring engine calculation error');
    allGood = false;
  }
} catch (e) {
  console.log('   ❌ Scoring engine failed to load');
  console.log(`      Error: ${e.message}`);
  allGood = false;
}

try {
  const { RecommendationEngine } = require('../src/recommendation-engine');
  const recEngine = new RecommendationEngine();
  console.log('   ✅ Recommendation engine loads correctly');
} catch (e) {
  console.log('   ❌ Recommendation engine failed to load');
  console.log(`      Error: ${e.message}`);
  allGood = false;
}
console.log('');

// Final verdict
console.log('═══════════════════════════════════════════════\n');
if (allGood) {
  console.log('✅ ALL CHECKS PASSED!\n');
  console.log('Your installation is ready to use.');
  console.log('Run "npm run demo" to start the interactive demo.\n');
} else {
  console.log('❌ SOME CHECKS FAILED\n');
  console.log('Please fix the issues above before running the demo.\n');
  if (missingFiles.length > 0) {
    console.log('Missing files: Make sure you extracted the complete archive.\n');
  }
  console.log('Common fixes:');
  console.log('  • Run "npm install" to install dependencies');
  console.log('  • Make sure you\'re in the balatro-ai-assistant directory');
  console.log('  • Check that Node.js 18+ is installed\n');
  process.exit(1);
}
