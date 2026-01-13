#!/usr/bin/env node
const { runNpx } = require('./utils');

// Parse command line arguments
// Default to list:articles if no argument provided
// Supports: articles, books
const args = process.argv.slice(2);
let command = 'list:articles';

if (args.length > 0) {
  const type = args[0];
  if (type === 'books' || type === 'book') {
    command = 'list:books';
    args.shift(); // Remove the type argument
  } else if (type === 'articles' || type === 'article') {
    command = 'list:articles';
    args.shift(); // Remove the type argument
  }
}

runNpx('zenn', command, args, 'zenn');
