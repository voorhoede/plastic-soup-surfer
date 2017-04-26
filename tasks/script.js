const gulp = require('gulp');

const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const gulpif = require('gulp-if');
const rollup = require('rollup').rollup;
const buble = require('rollup-plugin-buble');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const multiEntry = require('rollup-plugin-multi-entry');
const through = require('through2');
const path = require('path');

gulp.task('script', function () {
    var environment = process.env.NODE_ENV;

    rollup({
        entry : process.env.SRC_DIR + "/**/*.js",

        plugins : [
            multiEntry(),
            resolve({
                jsnext: true,
                main : true
            }),
            commonjs(),
            buble({
                objectAssign : 'Object.assign'
            })
        ]
    }).then(bundle => {
        return bundle.write({
            format : 'iife',
            sourceMap : true,
            moduleName : 'app',
            dest : process.env.DIST_DIR + '/assets/js/all.js'
        });
    }).then(() => {
        if(environment === "production") {
            const result = UglifyJS.minify([process.env.DIST_DIR + '/all.js']);

            fs.writeFileSync(process.env.DIST_DIR + '/all.js', result.code);
            fs.writeFileSync(process.env.DIST_DIR + '/all.js.map', result.map);
        }
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