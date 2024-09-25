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
      rules: {
        'no-console': 'error',
      },
    },
    {
      files: ['*.js', '*.jsx'],
      rules: {},
    },
  ],
};
