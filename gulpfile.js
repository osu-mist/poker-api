const forever = require('forever-monitor');
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const gulpIf = require('gulp-if');

// Use ESLint linting *.js files besides source files in node_modules
gulp.task('lint', () => gulp.src(['**/*.js', '!node_modules/**'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError()));

function isFixed(file) {
  return file.eslint != null && file.eslint.fixed;
}

// Use ESLint linting *.js files besides source files in node_modules and fix some simple errors.
gulp.task('lint-fix', () => gulp.src(['**/*.js', '!node_modules/**'])
  .pipe(eslint({ fix: true }))
  .pipe(eslint.format())
  .pipe(gulpIf(isFixed, gulp.dest('.')))
  .pipe(eslint.failAfterError()));

/**
 * @summary Run unit test
 */
gulp.task('test', () => gulp.src(['tests/unit/*.js'])
  .pipe(mocha({ reporter: 'spec' })));

/**
 * @summary Start application using forever
 */
gulp.task('start', () => new forever.Monitor('app.js').start());


/**
 * @summary Run test and lint task parallelly before start the apllication
 */
gulp.task('run', gulp.series(gulp.parallel('lint', 'test'), 'start'));
