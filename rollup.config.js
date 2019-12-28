var resolve = require('@rollup/plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');
var typescript = require('rollup-plugin-typescript2');
var { uglify } = require("rollup-plugin-uglify");
var dependencies = require('./package.json').dependencies;
var externalDependencies = dependencies ? Object.keys(dependencies) : [];

var config = {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'esm',
    sourcemap: true
  },
  plugins: [
    resolve(),
    commonjs({
      include: 'node_modules/**'
    }),
    typescript({
      tsconfig: './tsconfig.prod.json',
      tsconfigOverride: {
        compilerOptions: {
          declarationMap: process.env.NODE_ENV !== 'production'
        }
      }
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
