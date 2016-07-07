var gulp = require('gulp');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var cssmin = require('gulp-cssmin');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');


/*************************************************/


// javascript
gulp.task('buildJS', function(){
	gulp
	.src('./src/js/**/*.js')
	.pipe(concat('main.js'))
	.pipe(sourcemaps.init())
	.pipe(gulp.dest('./dist'))
	.pipe(rename({suffix : '.min'}))
	.pipe(uglify())
	.pipe(sourcemaps.write('./dist'))
	.pipe(gulp.dest('./'));
});


// css
gulp.task('buildCSS', function(){
	gulp
	.src('./src/css/**/*.css')
	.pipe(concat('main.css'))
	.pipe(autoprefixer())
	.pipe(sourcemaps.init())
	.pipe(gulp.dest('./dist'))
	.pipe(rename({suffix : '.min'}))
	.pipe(cssmin())
	.pipe(sourcemaps.write('./dist'))
	.pipe(gulp.dest('./'));
});


// build all
gulp.task('build', ['buildJS', 'buildCSS'], function(){
	console.log('Build Success...');
});

// watch all
gulp.task('watch', ['build'], function(){
	gulp.watch('./src/js/**/*.js', ['buildJS']);
	gulp.watch('./src/css/**/*.css', ['buildCSS']);
});