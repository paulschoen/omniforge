/* eslint-disable -- Disabling eslint for this file because it is a configuration file and does not need linting */
export default {
  displayName: 'mechanicus-scrivener',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/mechanicus-scrivener',
};
