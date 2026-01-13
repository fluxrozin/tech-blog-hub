#!/usr/bin/env node
const { runBlogsync } = require('./utils');

const args = process.argv.slice(2);
runBlogsync('pull', args, 'fluxrozin.hateblo.jp');
