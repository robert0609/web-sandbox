/*
 * @Author: bluefox
 * @Date: 2019-12-30 11:50:30
 * @LastEditors  : bluefox
 * @LastEditTime : 2020-01-03 10:20:07
 * @Description: file content
 */
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var del = require('del');
var rollup = require('rollup');
var rollupConfig = require('./rollup.config');

function clean() {
  return del([
    './dist/**/*'
  ]);
}

function lint() {
  return gulp.src(['./src/**/*.ts'])
    .pipe(eslint({
      fix: true
    }))
    .pipe(eslint.format('node_modules/eslint-friendly-formatter'))
    .pipe(eslint.failAfterError())
    .pipe(gulp.dest('./dist/'));
}

function lintTest() {
  return gulp.src(['./test/unit/**/*.test.ts'])
    .pipe(eslint({
      fix: true
    }))
    .pipe(eslint.format('node_modules/eslint-friendly-formatter'))
    .pipe(eslint.failAfterError())
    .pipe(gulp.dest('./dist/'));
}

function compile() {
  return rollup.rollup(rollupConfig).then(bundler => {
    return bundler.write(rollupConfig.output);
  })
}

exports.default = gulp.series(lint, clean, compile);

exports.lint = gulp.series(lint, clean);

exports.lintTest = gulp.series(lintTest, clean);
