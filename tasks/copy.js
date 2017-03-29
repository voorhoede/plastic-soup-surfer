const gulp = require('gulp');

gulp.task('copy', function () {
    return gulp.src(process.env.SRC_DIR + '/assets/!(images)/*')
        .pipe(gulp.dest(process.env.DIST_DIR + '/assets/'));
});

if(process.env.NODE_ENV === 'development') {
    const watch = require('gulp-watch');
    gulp.task('copy:watch', ['copy'], function () {
        watch(process.env.SRC_DIR  + '/assets/!(images)/*', () => {
            gulp.start('copy');
        });
    });
}