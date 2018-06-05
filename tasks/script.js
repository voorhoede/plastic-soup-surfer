const gulp = require('gulp');
const { join } = require('path');
const rollup = require('rollup').rollup;
const { uglify } = require('rollup-plugin-uglify');
const buble = require('rollup-plugin-buble');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const multiEntry = require('rollup-plugin-multi-entry');

const scriptsGlob = join(process.env.SRC_DIR, '/**/*.js');

gulp.task('script', buildScripts);
gulp.task('script:watch', () => gulp.watch(scriptsGlob, buildScripts));

function buildScripts() {
    return rollup({
        input: scriptsGlob,
        plugins: getPlugins(),
    }).then(bundle => {
        return bundle.write({
            format: 'iife',
            sourcemap: true,
            name: 'app',
            file: join(process.env.DIST_DIR, '/assets/js/all.js'),
        });
    })
}

function getPlugins() {
    let plugins = [
        multiEntry(),
        resolve({
            jsnext: true,
            main: true,
        }),
        commonjs(),
        buble({
            objectAssign: 'Object.assign',
        }),
    ];

    if (process.env.NODE_ENV === 'production') {
        plugins.push(uglify());
    }

    return plugins;
}
