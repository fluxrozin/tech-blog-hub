#!/usr/bin/env node
/**
 * Common utility functions for wrapper scripts
 */

const { spawn } = require('child_process');
const path = require('path');

/**
 * Run a command with specified options
 * @param {string} command - Command to run (e.g., 'npx', 'blogsync.exe')
 * @param {string[]} args - Arguments to pass to the command
 * @param {Object} options - Options for spawn
 * @param {string} options.cwd - Working directory
 * @param {string|string[]} options.stdio - stdio option (default: 'inherit')
 * @param {boolean} options.shell - Use shell (default: false)
 */
function runCommand(command, args, options = {}) {
  const {
    cwd,
    stdio = 'inherit',
    shell = false
  } = options;

  const child = spawn(command, args, {
    cwd,
    stdio,
    shell
  });

  child.on('close', (code) => {
    process.exit(code || 0);
  });

  child.on('error', (err) => {
    console.error(`Error running ${command}:`, err);
    process.exit(1);
  });
}

/**
 * Run npx command in a specific directory
 * @param {string} packageName - Package name (e.g., 'qiita', 'zenn')
 * @param {string} subCommand - Subcommand to run
 * @param {string[]} extraArgs - Additional arguments
 * @param {string} targetDir - Target directory (relative to scripts/)
 */
function runNpx(packageName, subCommand, extraArgs = [], targetDir) {
  const targetPath = path.join(__dirname, '..', targetDir);
  const args = [packageName, subCommand, ...extraArgs];
  runCommand('npx', args, {
    cwd: targetPath,
    stdio: 'inherit',
    shell: true
  });
}

/**
 * Run blogsync command
 * @param {string} subCommand - Subcommand (e.g., 'pull', 'push', 'fetch')
 * @param {string[]} extraArgs - Additional arguments
 * @param {string} defaultBlogId - Default blog ID for pull command
 */
function runBlogsync(subCommand, extraArgs = [], defaultBlogId = null) {
  const hatenaPath = path.join(__dirname, '..', 'hatena');
  const args = [subCommand];
  
  if (subCommand === 'pull' && defaultBlogId && extraArgs.length === 0) {
    args.push(defaultBlogId);
  } else {
    args.push(...extraArgs);
  }
  
  runCommand('blogsync.exe', args, {
    cwd: hatenaPath,
    stdio: 'inherit'
  });
}

module.exports = {
  runCommand,
  runNpx,
  runBlogsync
};
