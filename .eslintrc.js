'use strict';

module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      plugins: [
        ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }],
      ],
    },
  },
  plugins: ['ember'],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    browser: true,
  },
  rules: {
    'no-restricted-syntax': [
      'error',
      // Match `@service fastboot`
      {
        selector:
          "Decorator[expression.name='service'][parent.key.name='fastboot']",
        message: `Using \`@service fastboot\` should not be used as we can't guarantee the presence of a fastboot service.
                  Use a dynamic getter to access the fastboot service instead.`,
      },
      // Match `@service('fastboot') ...`
      {
        selector:
          "Decorator[expression.type='CallExpression'][expression.callee.name='service'] Literal[value='fastboot']",
        message: `Using \`@service('fastboot')\` should not be used as we can't guarantee the presence of a fastboot service.
                  Use a dynamic getter to access the fastboot service instead.`,
      },
    ],
  },
  overrides: [
    // node files
    {
      files: [
        './.eslintrc.js',
        './.prettierrc.js',
        './.stylelintrc.js',
        './.template-lintrc.js',
        './ember-cli-build.js',
        './index.js',
        './testem.js',
        './blueprints/*/index.js',
        './blueprints/rdf-route/router-generator/**/*.js',
        './config/**/*.js',
        './tests/dummy/config/**/*.js',
      ],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
      },
      extends: ['plugin:n/recommended'],
    },
    {
      // test files
      files: ['tests/**/*-test.{js,ts}'],
      extends: ['plugin:qunit/recommended'],
    },
  ],
};
