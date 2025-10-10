
// backend/jest.config.js
export default {
  testEnvironment: 'node',
  transform: {},
  // Habilita el soporte para módulos ES6 (import/export)
  extensionsToTreatAsEsm: ['.js'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapper: {
    '^\\\\./(.*\\.js)$': '\\./$1',
  },
};
