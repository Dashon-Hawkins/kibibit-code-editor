// grab our packages
var gulp   = require('gulp'),
beautify = require('gulp-jsbeautifier'),
sourcemaps = require('gulp-sourcemaps'),
sass = require('gulp-sass'),
minifyCSS = require('gulp-minify-css'),
rename = require('gulp-rename'),
prettify = require('gulp-jsbeautifier'),
jshint = require('gulp-jshint'),
concat = require('gulp-concat'),
livereload = require('gulp-livereload'),
server = require('gulp-develop-server'),
shell = require('gulp-shell'),
jscs = require('gulp-jscs'),
argv = require('yargs').argv,
gutil = require('gulp-util');

var options = {
  path: './server.js'
};
var FILES = {};
FILES.FRONTEND_JS = ['./public/app/**/*.js'];
FILES.FRONTEND_HTML = ['./public/app/**/*.html'];
FILES.FRONTEND_SASS = ['./public/assets/sass/**/*.scss'];
FILES.FRONTEND_ALL = [].concat(FILES.FRONTEND_JS, FILES.FRONTEND_HTML, FILES.FRONTEND_SASS);
FILES.SERVER_MAIN = ['./server.js'];
FILES.SERVER_JS_WITHOUT_MAIN = ['./app/**/*.js', './config.js'];
FILES.SERVER_JS = [].concat(FILES.SERVER_MAIN, FILES.SERVER_JS_WITHOUT_MAIN);
FILES.BUILD_FILES = ['./gulpfile.js'];
FILES.JS_ALL = [].concat(FILES.FRONTEND_JS, FILES.SERVER_JS);
FILES.LINT = [].concat(FILES.FRONTEND_JS, FILES.SERVER_JS_WITHOUT_MAIN);

// define the default task and add the watch task to it
gulp.task('default', ['watch']);

// configure the jshint task
gulp.task('lint-js', function() {
  return gulp.src(FILES.JS_ALL)
  .pipe(jscs())
  .pipe(jscs.reporter());
});

gulp.task('lint-sass', function() {
  return gulp.src(FILES.FRONTEND_SASS)
  .pipe(sass().on('error', sass.logError));
});

gulp.task('lint', ['lint-js', 'lint-sass']);

gulp.task('format-front-end', function() {
  return gulp.src([].concat(FILES.FRONTEND_JS), {
    base: 'public'
  })
	.pipe(jscs({fix: true}))
	.pipe(jscs.reporter())
	.pipe(gulp.dest('./public')); // add this to a different folder in order to test first
});

gulp.task('format-server', function() {
  return gulp.src([].concat(FILES.SERVER_JS, FILES.BUILD_FILES), {
    base: '.'
  })
	.pipe(jscs({fix: true}))
	.pipe(jscs.reporter())
	.pipe(gulp.dest('.'));
});

gulp.task('format', ['format-server', 'format-front-end']);

gulp.task('styles', function() {
  return gulp.src(FILES.FRONTEND_SASS)
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(concat('style.css'))
  //.pipe(minifyCSS())
  .pipe(sourcemaps.write())
  //.pipe(rename({ suffix: '.min' }))
  .pipe(gulp.dest('./public/assets/css/'));
});

gulp.task('serve', ['styles'], function() {
  server.listen(options, livereload.listen);
});

gulp.task('debug', ['styles'], shell.task(['node-debug server.js']));

// configure which files to watch and what tasks to use on file changes
gulp.task('watch', ['serve'], function() {
  function restart(file) {
    server.changed(function(error) {
      if (!error) {
        reloadBrowser('Backend file changed.', file.path);
      }
    });
  }

  function reloadBrowser(message, path) {
    	gutil.log(message ? message : 'Something changed.', gutil.colors.bgBlue.white.bold('Reloading browser...'));
    	livereload.changed(path);
  }

  gulp.watch(argv.lint ? FILES.LINT : [], ['lint-js']);
  gulp.watch(FILES.FRONTEND_SASS, ['styles']);
  gulp.watch(FILES.SERVER_JS).on('change', restart);
  gulp.watch(FILES.FRONTEND_ALL).on('change', function(file) {reloadBrowser('Frontend file changed.', file.path);});
});