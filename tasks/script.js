const gulp = require('gulp');

const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const rollup = require('rollup').rollup;
const uglify = require('rollup-plugin-uglify');
const buble = require('rollup-plugin-buble');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const multiEntry = require('rollup-plugin-multi-entry');
const through = require('through2');
const path = require('path');

gulp.task('script', function () {
    var environment = process.env.NODE_ENV;

    function getPlugins() {
        let plugins = [
            multiEntry(),
            resolve({
                jsnext: true,
                main : true
            }),
            commonjs(),
            buble({
                objectAssign : 'Object.assign'
            }),
        ];

        if(process.env.NODE_ENV === "production") {
            plugins.push(
                uglify()
            );
        }

        return plugins;
    }

    rollup({
        entry : process.env.SRC_DIR + "/**/*.js",
        plugins : getPlugins()
    }).then(bundle => {
        return bundle.write({
            format : 'iife',
            sourceMap : true,
            moduleName : 'app',
            dest : process.env.DIST_DIR + '/assets/js/all.js'
        });
    });
});

if(process.env.NODE_ENV === 'development') {
    const watch = require('gulp-watch');
    gulp.task('script:watch', ['script'], function () {
        watch(process.env.SRC_DIR  + '/**/*.js', () => {
            gulp.start('script');
        });
    });
}