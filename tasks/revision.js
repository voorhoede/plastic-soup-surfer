const gulp = require('gulp');
const rev = require('gulp-rev');
const { join } = require('path');

gulp.task('revision', () =>
    gulp
        .src([
            process.env.DIST_DIR + '/**/main.css',
            process.env.DIST_DIR + '/**/all.js',
            process.env.DIST_DIR + '/**/manifest.json',
        ])
        .pipe(rev())
        .pipe(gulp.dest(process.env.DIST_DIR))
        .pipe(rev.manifest(join(process.env.DIST_DIR, 'rev-manifest.json')))
        .pipe(gulp.dest('.'))
);
