const cssDeclarationSorter = require('css-declaration-sorter');
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const less = require('gulp-less');
const plumber = require('gulp-plumber');
const cleanCSS = require('gulp-clean-css');
const gulpif = require('gulp-if');
const postcss = require('gulp-postcss');
const postcssLess = require('postcss-less');
const { join } = require('path');

const stylesGlob = join(process.env.SRC_DIR, '**', '*.less');

gulp.task('style', buildStyle);

gulp.task('style:watch', () =>
    gulp.watch(stylesGlob, () => {
        clearLessCacheHack();
        buildStyle();
    })
);

gulp.task('style:format', () =>
    gulp
        .src(stylesGlob, { base: './' })
        .pipe(
            postcss([cssDeclarationSorter({ order: 'smacss' })], {
                syntax: postcssLess,
            })
        )
        .pipe(gulp.dest('.'))
);

function buildStyle() {
    const environment = process.env.NODE_ENV;

    return gulp
        .src(process.env.SRC_DIR + '/main.less')
        .pipe(plumber())
        .pipe(gulpif(environment !== 'production', sourcemaps.init()))
        .pipe(
            less({
                paths: [process.env.SRC_DIR],
            })
        )
        .on('error', function(error) {
            console.error(error.message);
            this.emit('end');
        })
        .pipe(autoprefixer({ browsers: ['> 1%', 'last 2 versions'] }))
        .pipe(gulpif(environment === 'production', cleanCSS()))
        .pipe(gulpif(environment !== 'production', sourcemaps.write('./')))
        .pipe(gulp.dest(process.env.DIST_DIR + '/assets/css/'));
}

function clearLessCacheHack() {
    const gulpLessVersion = require('../package-lock.json').dependencies[
        'gulp-less'
    ].version;

    if (gulpLessVersion !== '4.0.0') {
        throw new Error(`
            This is a temporary hacky workaround to solve:
            https://github.com/less/less.js/issues/3185
            Remove when the issue is solved.
        `);
    }

    const less = require('less');
    const fileManagers =
        (less.environment && less.environment.fileManagers) || [];

    fileManagers.forEach(fileManager => {
        if (fileManager.contents) {
            fileManager.contents = {};
        }
    });
}
