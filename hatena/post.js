#!/usr/bin/env node
/**
 * Wrapper script for blogsync post command
 * Properly handles arguments and stdin on all platforms
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure the command is run from within the project root
const projectRoot = path.join(__dirname, '..');
const packageJsonPath = path.join(projectRoot, 'package.json');
const currentDir = process.cwd();

if (!fs.existsSync(packageJsonPath)) {
  console.error('Error: package.json not found in project root.');
  process.exit(1);
}

const relativePath = path.relative(projectRoot, currentDir);
// If relativePath starts with '..', currentDir is outside projectRoot
if (relativePath.startsWith('..')) {
  console.error('Error: This command must be run from within the project root directory.');
  console.error(`Project root: ${projectRoot}`);
  console.error(`Current directory: ${currentDir}`);
  console.error('\nPlease change to the project root directory and try again.');
  process.exit(1);
}

// Default blog ID
let blogId = process.env.HATENA_BLOG_ID || 'fluxrozin.hateblo.jp';
const args = [];

// Check for environment variables first
if (process.env.HATENA_TITLE) {
  args.push(`--title=${process.env.HATENA_TITLE}`);
}
if (process.env.HATENA_DRAFT === 'true') {
  args.push('--draft');
}

// Parse command line arguments
const processArgs = process.argv.slice(2);
for (let i = 0; i < processArgs.length; i++) {
  const arg = processArgs[i];

  // Support title=value format
  if (arg.startsWith('title=')) {
    args.push(`--title=${arg.substring(6)}`);
  }
  // Support draft flag
  else if (arg === 'draft') {
    args.push('--draft');
  }
  // Support both --title and -title formats with space-separated value
  else if ((arg === '--title' || arg === '-title') && i + 1 < processArgs.length) {
    args.push(`--title=${processArgs[i + 1]}`);
    i++;
  }
  // Support --title=value and -title=value formats
  else if (arg.startsWith('--title=') || arg.startsWith('-title=')) {
    args.push(`--title=${arg.split('=')[1]}`);
  }
  // Support --draft and -draft flags
  else if (arg === '--draft' || arg === '-draft') {
    args.push('--draft');
  }
  // Last non-option argument is the blog ID
  else if (!arg.startsWith('-')) {
    blogId = arg;
  }
}

// Build the blogsync command
const blogsyncPath = path.join(__dirname, 'blogsync.exe');
const blogsyncArgs = ['post', ...args, blogId];

// Spawn blogsync with stdin from parent process
const blogsync = spawn(blogsyncPath, blogsyncArgs, {
  stdio: ['inherit', 'inherit', 'inherit'],
  cwd: __dirname,
});

blogsync.on('close', (code) => {
  process.exit(code || 0);
});

blogsync.on('error', (err) => {
  console.error('Error running blogsync:', err);
  process.exit(1);
});
