// eslint-disable-next-line import/no-default-export -- Jest configuration requires a default export
export default {
  displayName: 'data-access',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/lib/shared/data-access',
};
