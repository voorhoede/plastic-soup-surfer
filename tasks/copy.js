const gulp = require('gulp');
const { join } = require('path');

const assetsGlob = join(process.env.SRC_DIR, 'assets', '!(images)', '*');

gulp.task('copy', copyAssets);

gulp.task('copy:watch', () => gulp.watch(assetsGlob, copyAssets));

function copyAssets() {
    return gulp
        .src(assetsGlob, { since: gulp.lastRun('copy') })
        .pipe(gulp.dest(join(process.env.DIST_DIR, 'assets')));
}
