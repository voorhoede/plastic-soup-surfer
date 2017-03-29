const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const less = require('gulp-less');
const plumber = require('gulp-plumber');
const cleanCSS = require('gulp-clean-css');
const gulpif = require('gulp-if');

gulp.task('style', function () {
    const environment = process.env.NODE_ENV;

    return gulp.src(process.env.SRC_DIR + '/main.less')
		.pipe(plumber())
		.pipe(gulpif(environment !== 'production', sourcemaps.init()))
		.pipe(less({
            paths : [process.env.SRC_DIR]
        }))
		.on('error', function(error) {
			console.error(error.message);
			this.emit('end');
		})
		.pipe(autoprefixer({ browsers: ['> 1%', 'last 2 versions'] }))
		.pipe(gulpif(environment === 'production', cleanCSS()))
		.pipe(gulpif(environment !== 'production', sourcemaps.write('./')))
		.pipe(gulp.dest(process.env.DIST_DIR + '/assets/css/'));
});

if(process.env.NODE_ENV === 'development') {
    const watch = require('gulp-watch');
	gulp.task('style:watch', ['style'], function () {
		return watch(process.env.SRC_DIR  + '/**/*.less', () => {
			gulp.start('style');
		});
	});
}