var 
	gulp = require('gulp'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	cssmin = require('gulp-cssmin'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	uglify = require('gulp-uglify'),
	sourcemaps = require('gulp-sourcemaps')
	gzip = require('gulp-gzip')
;


/*************************************************/


// JavaScript
gulp.task('buildJS', function(){
	gulp
	.src('./src/js/**/*.js')
	.pipe(concat('ng-image-gallery.js'))
	.pipe(sourcemaps.init())
	.pipe(gulp.dest('./dist'))
	.pipe(rename({suffix : '.min'}))
	.pipe(uglify())
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest('./dist'))
	.pipe(gzip({append:true}))
	.pipe(gulp.dest('./dist'))
	;
});


// Css / Sass(.scss)
gulp.task('buildCSS', function(){
	gulp
	.src('./src/sass/**/*.scss')
	.pipe(concat('ng-image-gallery.scss'))
	.pipe(sass().on('error', sass.logError))
	.pipe(autoprefixer())
	.pipe(sourcemaps.init())
	.pipe(gulp.dest('./dist'))
	.pipe(rename({suffix : '.min'}))
	.pipe(cssmin())
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest('./dist'))
	.pipe(gzip({append:true}))
	.pipe(gulp.dest('./dist'))
	;
});


// build all
gulp.task('build', ['buildJS', 'buildCSS'], function(){
	console.log('Build Success...');
});

// watch all
gulp.task('watch', ['build'], function(){
	gulp.watch('./src/js/**/*.js', ['buildJS']);
	gulp.watch('./src/sass/**/*.scss', ['buildCSS']);
});