#!/usr/bin/env node
const { runNpx, ensureProjectRoot } = require('./utils');

ensureProjectRoot();

// Parse command line arguments
// Default to new:article if no argument provided
// Supports: article, book
const args = process.argv.slice(2);
let command = 'new:article';

if (args.length > 0) {
  const type = args[0];
  if (type === 'book' || type === 'books') {
    command = 'new:book';
    args.shift(); // Remove the type argument
  } else if (type === 'article' || type === 'articles') {
    command = 'new:article';
    args.shift(); // Remove the type argument
  } else if (!type.startsWith('-')) {
    // If first argument doesn't start with -, assume it's a type
    // But if it's not recognized, keep it as is (might be a slug or other option)
  }
}

// Article supports: --slug, --title, --type, --emoji
// Book supports: --slug
runNpx('zenn', command, args, 'zenn');
