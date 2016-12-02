// SMILE_PLEASE //
//////////////////

	// Gulp
	var gulp = require('gulp');

	// Sass/CSS stuff
	var sass = require('gulp-sass');
	var prefix = require('gulp-autoprefixer');
	var minifycss = require('gulp-minify-css');

	// JavaScript
	var uglify = require('gulp-uglify');

	// Images
	var imagemin = require('gulp-imagemin');

	// Stats and Things
	var size = require('gulp-size');

	var src = "./example";
	var dest = "./example/public";


	// compile all your Sass
		gulp.task('sass', function (){
			gulp.src([src + '/assets/styles/**/*.scss', '!' + src + '/assets/styles/_variables.scss'])
				.pipe(sass({
					includePaths: [src + '/assets/styles'],
					outputStyle: 'expanded'
				}))
				.pipe(prefix(
					"last 1 version", "> 1%", "ie 8", "ie 7"
					))
				// .pipe(gulp.dest(dest + '/css'))
				// .pipe(minifycss())
				.pipe(gulp.dest(dest + '/css'));
		});

	// Uglify JS
		gulp.task('uglify', function(){
			gulp.src(src + '/smilePlease.js')
				.pipe(uglify())
				.pipe(gulp.dest(dest + '/js'));
		});

	// Images
		
		gulp.task('imagemin', function () {
			gulp.src(src + '/assets/img/**/*')
			.pipe(imagemin())
			.pipe(gulp.dest(dest + '/img'));
		});

	// Stats and Things
		gulp.task('stats', function () {
			gulp.src(dest + '/js/smilePlease.js')
			.pipe(size())
			.pipe(gulp.dest(dest));
		});

	gulp.task('default', ['sass', 'uglify', 'imagemin', 'stats']);

	gulp.task('watch', ['default'], function() {

		// watch me getting Sassy
		gulp.watch(src + "/assets/styles/*.scss", ["sass"]);
		// make my JavaScript ugly
		gulp.watch(src + "/smilePlease.js", ["uglify"]);
		// images
		gulp.watch(src + "/assets/img/**/*", ["imagemin"]);
	});