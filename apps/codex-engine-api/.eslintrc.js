const baseEslintConfig = require('../../.eslintrc.js');

module.exports = {
  ...baseEslintConfig,
  ignorePatterns: ['!**/*'],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      rules: {
        '@typescript-eslint/no-extraneous-class': 'off',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: ['plugin:@darraghor/nestjs-typed/recommended'],
      plugins: ['@darraghor/nestjs-typed'],
      rules: {
        'no-console': 'error',
        '@darraghor/nestjs-typed/injectable-should-be-provided': [
          'error',
          {
            src: ['apps/codex-engine-api/src/**/*.ts'],
            filterFromPaths: ['node_modules', '.test.', '.spec.'],
          },
        ],
      },
    },
    {
      files: ['*.js', '*.jsx'],
      rules: {},
    },
  ],
};
