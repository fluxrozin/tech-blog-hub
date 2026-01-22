#!/usr/bin/env node
const { runBlogsync, ensureProjectRoot } = require('./utils');

ensureProjectRoot();

const args = process.argv.slice(2);
runBlogsync('fetch', args);
