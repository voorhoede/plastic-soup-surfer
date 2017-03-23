const gulp = require('gulp');

const buble = require('gulp-buble');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const gulpif = require('gulp-if');
const watch = require('gulp-watch');

gulp.task('script', function () {
    var environment = process.env.NODE_ENV;

    return gulp.src(process.env.SRC_DIR + "/**/*.js")
        .pipe(gulpif(environment !== 'production', sourcemaps.init()))
        .pipe(buble())
        .pipe(concat('all.js'))
        .pipe(gulpif(environment === 'production', uglify()))
        .pipe(gulpif(environment !== 'production', sourcemaps.write('./')))
        .pipe(gulp.dest(process.env.DIST_DIR + '/assets/js/'))
});

gulp.task('script:watch', ['script'], function () {
    watch(process.env.SRC_DIR  + '/**/*.js', () => {
        gulp.start('script');
    });
});