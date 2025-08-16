module.exports = {
  root: true,
  env: {
    node: true,
    es2020: true
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'script'
  },
  // Keep ESLint minimal and non-intrusive for this repo
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    // Allow console logs in CLI helpers
    'no-console': 'off',
    // The project é CLI: permitir process.exit
    'no-process-exit': 'off',
    // Enforce removal of unused variables, allow intentionally-ignored args with _ prefix
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    // Flag unnecessary escapes to keep regexes/strings clean
    'no-useless-escape': 'error'
  },
  // Allow process.exit in CLI entrypoints
  overrides: [
    {
      files: ['bin/**', 'scripts/**', 'cli/**', '*.cli.js', 'bin/*.js', 'scripts/*.js'],
      rules: {
        'no-process-exit': 'off'
      }
    }
  ]
}
