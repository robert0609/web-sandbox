/*
 * @Author: bluefox
 * @Date: 2019-12-30 11:50:30
 * @LastEditors  : bluefox
 * @LastEditTime : 2020-01-03 10:56:04
 * @Description: rollup config
 */
var resolve = require('@rollup/plugin-node-resolve');
var commonjs = require('@rollup/plugin-commonjs');
var babel = require("rollup-plugin-babel");
var { uglify } = require("rollup-plugin-uglify");
var dependencies = require('./package.json').dependencies;
var externalDependencies = dependencies ? Object.keys(dependencies) : [];

var extensions = [
  '.js', '.jsx', '.ts', '.tsx',
];

var config = {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'esm',
    sourcemap: true
  },
  plugins: [
    resolve({ extensions }),
    commonjs({
      include: 'node_modules/**'
    }),
    babel({
      extensions,
      exclude: 'node_modules/**',
      runtimeHelpers: true
    })
  ],
  external: function (moduleName) {
    return externalDependencies.some(item => moduleName.startsWith(item));
  }
};
if (process.env.NODE_ENV === 'production') {
  config.output.sourcemap = false;
  if (config.output.format !== 'esm') {
    config.plugins.push(uglify());
  }
}

module.exports = config;
