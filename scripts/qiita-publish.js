#!/usr/bin/env node
const { runNpx, ensureProjectRoot } = require('./utils');

ensureProjectRoot();

const args = process.argv.slice(2);
runNpx('qiita', 'publish', args, 'qiita');
