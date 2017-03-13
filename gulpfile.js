const gulp = require('gulp');
const babel = require('gulp-babel');
const watch = require('gulp-watch');
const eslint = require('gulp-eslint');
const es6Path = 'src/*.js';

// babel > ES2015
gulp.task('babel', () => {
	return gulp.src([es6Path])
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(gulp.dest('dist/js'));
});

// eslint
gulp.task('eslint', () => {
  return gulp.src('src/*.js').pipe(eslint({
    'parser': 'babel-eslint',
	  'rules':{
        'quotes': [1, 'single'],
        'semi': [1, 'always']
    }
  }))
  .pipe(eslint.format())
  // Brick on failure to be super strict
  .pipe(eslint.failOnError());
});

// watch > eslint + babel
gulp.task('watch', () => {
    gulp.watch([es6Path], ['eslint', 'babel']);
});

// default task
gulp.task('default', ['babel', 'watch']);
