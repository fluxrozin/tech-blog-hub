#!/usr/bin/env node
const { runNpx } = require('./utils');

const args = process.argv.slice(2);
runNpx('zenn', 'preview', args, 'zenn');
