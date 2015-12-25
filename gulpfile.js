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
server = require('gulp-develop-server');

var options = {
	path: './server.js'
};
 
var serverFiles = [
    './app/**/*.js',
	'./server.js'
];

// define the default task and add the watch task to it
gulp.task('default', ['watch']);

// configure the jshint task
gulp.task('lint-js', function() {
	return gulp.src(['./**/*.js', '!./node_modules/', '!./node_modules/**', '!./logs/', '!./public/assets/**'])
	.pipe(jshint())
	.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('lint-sass', function() {
	return gulp.src('./public/assets/sass/**/*.scss')
	.pipe(sass().on('error', sass.logError));
});

gulp.task('lint', ['lint-js', 'lint-sass']);

gulp.task('format-front-end', function() {
	return gulp.src([
		/* JavaScript */
		'./public/app/**/*.js', // front-end javascript
		/* HTML */
		'./public/app/**/*.html', // front-end javascript
	], {
             base: 'public'
        })
	.pipe(prettify({
	    //config: "./.jsbeautifyrc",
	    html: {
	        braceStyle: "collapse",
	        indentChar: " ",
	        indentScripts: "keep",
	        indentSize: 4,
	        maxPreserveNewlines: 10,
	        preserveNewlines: true,
	        /* unformatted: ["a", "sub", "sup", "b", "i", "u"], */
	        wrapLineLength: 0
	    },
	    js: {
	        braceStyle: "collapse",
	        breakChainedMethods: false,
	        e4x: false,
	        evalCode: false,
	        indentChar: " ",
	        indentLevel: 0,
	        indentSize: 4,
	        indentWithTabs: false,
	        jslintHappy: false,
	        keepArrayIndentation: false,
	        keepFunctionIndentation: false,
	        maxPreserveNewlines: 10,
	        preserveNewlines: true,
	        spaceBeforeConditional: true,
	        spaceInParen: false,
	        unescapeStrings: false,
	        wrapLineLength: 0
	    }
	}))
	.pipe(gulp.dest('./public')); // add this to a different folder in order to test first
});

gulp.task('format-server', function() {
	return gulp.src([
		/* JavaScript */
		'./app/**/*.js',
		'./server.js'
	], {
             base: '.'
        })
	.pipe(prettify({
	    js: {
	        braceStyle: "collapse",
	        breakChainedMethods: false,
	        e4x: false,
	        evalCode: false,
	        indentChar: " ",
	        indentLevel: 0,
	        // indentSize: 4,
	        indentWithTabs: false,
	        jslintHappy: false,
	        keepArrayIndentation: false,
	        keepFunctionIndentation: false,
	        maxPreserveNewlines: 10,
	        preserveNewlines: true,
	        spaceBeforeConditional: true,
	        spaceInParen: false,
	        unescapeStrings: false,
	        wrapLineLength: 0
	    }
	}))
	.pipe(gulp.dest('.'));
});

gulp.task('format', ['format-server', 'format-front-end']);

gulp.task('styles', function() {
	return gulp.src('./public/assets/sass/**/*.scss')
	.pipe(sourcemaps.init())
	.pipe(sass().on('error', sass.logError))
	.pipe(concat('style.css'))
	//.pipe(minifyCSS())
	.pipe(sourcemaps.write())
	//.pipe(rename({ suffix: '.min' }))
	.pipe(gulp.dest('./public/assets/css/'));
});

gulp.task( 'serve', function() {
    server.listen(options, livereload.listen);
});

// configure which files to watch and what tasks to use on file changes
gulp.task('watch', [ 'serve' ], function() {
	function restart( file ) {
        server.changed( function( error ) {
            if( ! error ) livereload.changed( file.path );
        });
    }

	gulp.watch(['./**/*.js', '!./node_modules/', '!./node_modules/**', '!./logs/'], ['lint-js']);
	gulp.watch('./public/assets/sass/**/*.scss', ['styles']);
	gulp.watch( serverFiles ).on( 'change', restart );
	gulp.watch(['./public/app/**/*', './public/assets/sass/**/*.scss']).on( 'change', function(file) {livereload.changed( file.path );} );
});
