const gulp = require('gulp');

const buble = require('gulp-buble');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const gulpif = require('gulp-if');
const watch = require('gulp-watch');
const iife = require('gulp-iife');

gulp.task('script', function () {
    var environment = process.env.NODE_ENV;

    return gulp.src(process.env.SRC_DIR + "/**/*.js")
        .pipe(sourcemaps.init())
        .pipe(buble())
        .pipe(concat('all.js'))
        .pipe(iife())
        .pipe(gulpif(environment !== 'development', uglify()))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(process.env.DIST_DIR + '/assets/js/'))
});

gulp.task('script:watch', ['script'], function () {
    watch(process.env.SRC_DIR  + '/**/*.js', () => {
        gulp.start('script');
    });
});