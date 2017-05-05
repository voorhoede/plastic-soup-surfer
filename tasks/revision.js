const gulp = require('gulp');
const rev = require('gulp-rev');
const revdel = require('gulp-rev-delete-original');

gulp.task('revision', function() {
    const manifestPath = process.env.DIST_DIR + '/rev-manifest.json';

	return gulp.src([
			process.env.DIST_DIR + '/**/main.css',
			process.env.DIST_DIR + '/**/all.js',
			process.env.DIST_DIR + '/**/manifest.json'
		])
		.pipe(rev())
		.pipe(revdel())
		.pipe(gulp.dest(process.env.DIST_DIR))
		.pipe(rev.manifest(manifestPath))
		.pipe(gulp.dest(''));
});