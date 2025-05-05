#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

// Configuration
const config = {
  testCommand: 'jest',
  watchMode: process.argv.includes('--watch'),
  coverage: process.argv.includes('--coverage'),
  updateSnapshots: process.argv.includes('--updateSnapshot'),
  ci: process.argv.includes('--ci'),
  pattern: process.argv.find(arg => arg.startsWith('--pattern='))?.split('=')[1]
};

async function runTests() {
  console.log(chalk.blue('🚀 Starting test runner...'));

  const args = [
    '--config=jest.config.js',
    '--colors',
    config.watchMode && '--watch',
    config.coverage && '--coverage',
    config.updateSnapshots && '--updateSnapshot',
    config.ci && '--ci',
    config.pattern && `--testPathPattern=${config.pattern}`
  ].filter(Boolean);

  const testProcess = spawn('node', [
    path.resolve(__dirname, '../node_modules/.bin/jest'),
    ...args
  ], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'test'
    }
  });

  return new Promise((resolve, reject) => {
    testProcess.on('exit', code => {
      if (code === 0) {
        console.log(chalk.green('✅ Tests completed successfully!'));
        resolve();
      } else {
        console.error(chalk.red('❌ Tests failed!'));
        reject(new Error(`Tests failed with code ${code}`));
      }
    });

    testProcess.on('error', error => {
      console.error(chalk.red('❌ Error running tests:'), error);
      reject(error);
    });
  });
}

async function generateReport() {
  if (!config.coverage) return;

  console.log(chalk.blue('📊 Generating test coverage report...'));

  // Ensure coverage directory exists
  const coverageDir = path.resolve(__dirname, '../coverage');
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir);
  }

  // Generate HTML report
  const reportProcess = spawn('node', [
    path.resolve(__dirname, '../node_modules/.bin/jest'),
    '--coverage',
    '--coverageReporters=html',
    '--coverageDirectory=coverage'
  ], {
    stdio: 'inherit'
  });

  return new Promise((resolve, reject) => {
    reportProcess.on('exit', code => {
      if (code === 0) {
        console.log(chalk.green('📋 Coverage report generated in coverage/'));
        resolve();
      } else {
        console.error(chalk.red('❌ Failed to generate coverage report'));
        reject(new Error(`Report generation failed with code ${code}`));
      }
    });
  });
}

async function main() {
  try {
    // Run tests
    await runTests();

    // Generate report if coverage is enabled
    if (config.coverage) {
      await generateReport();
    }

    // Print summary
    console.log(chalk.blue('\n📝 Test Summary:'));
    console.log(chalk.gray('• Mode:'), config.watchMode ? 'Watch' : 'Single Run');
    console.log(chalk.gray('• Coverage:'), config.coverage ? 'Yes' : 'No');
    console.log(chalk.gray('• Pattern:'), config.pattern || 'All Tests');

    if (!config.watchMode) {
      process.exit(0);
    }
  } catch (error) {
    console.error(chalk.red('\n❌ Test runner failed:'), error);
    process.exit(1);
  }
}

// Run the script
main();
