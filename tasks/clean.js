const del = require('del');
const gulp = require('gulp');

gulp.task('clean', () => {
    return del(process.env.DIST_DIR + "/**/*");
});