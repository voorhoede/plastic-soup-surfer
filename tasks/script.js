const gulp = require('gulp');

const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const gulpif = require('gulp-if');
const rollup = require('gulp-better-rollup')
const buble = require('rollup-plugin-buble');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const through = require('through2');
const path = require('path');

gulp.task('script', function () {
    var environment = process.env.NODE_ENV;

    return gulp.src(process.env.SRC_DIR + "/**/*.js")
        .pipe(through.obj(function (chunk, enc, callback) {
            const dir = path.dirname(chunk.path).split("/").pop();
            if(dir === path.basename(chunk.path, ".js")) {
                this.push(chunk);
            }
            callback();
        }))
        .pipe(sourcemaps.init())
        .pipe(rollup({
            plugins : [
                resolve({
                    jsnext: true,
                    main : true
                }),

                commonjs({

                }),

                buble()
            ]
        }, 
        [
            {dest : 'all.js', format : 'iife'}
        ]))
        .pipe(gulpif(environment !== 'development', uglify()))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(process.env.DIST_DIR + '/assets/js/'))
});

if(process.env.NODE_ENV === 'development') {
    const watch = require('gulp-watch');
    gulp.task('script:watch', ['script'], function () {
        watch(process.env.SRC_DIR  + '/**/*.js', () => {
            gulp.start('script');
        });
    });
}