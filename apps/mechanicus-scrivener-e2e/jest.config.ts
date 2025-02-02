/* eslint-disable -- Disabling eslint for this file because it is a configuration file and does not need linting */

export default {
  displayName: 'mechanicus-scrivener-e2e',
  preset: '../../jest.preset.js',
  setupFiles: ['<rootDir>/src/test-setup.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/mechanicus-scrivener-e2e',
};
