/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

module.exports = {
  transform: { '^.+\\.ts?$': 'ts-jest' },
  testEnvironment: 'node',
  testRegex: '/tests/.*\\.(test|spec)?\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^[@]/(.*)': path.resolve(__dirname, 'src/$1')
  }
}
