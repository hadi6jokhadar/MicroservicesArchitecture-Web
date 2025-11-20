import baseConfig from '../../eslint.base.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['src/**/*.ts'],
    rules: {},
  },
  {
    files: ['src/**/*.html'],
    rules: {},
  },
];
