const gulp = require('gulp');
const responsive = require('gulp-responsive');

gulp.task('images', function() {
    return gulp
        .src(process.env.SRC_DIR + '/**/*.{png,jpg,jpeg}', {
            base: process.env.SRC_DIR,
            since: gulp.lastRun('images'),
        })
        .pipe(
            responsive({
                'assets/images/logo.png': [
                    { width: 115, height: 113 },
                    {
                        width: 115 * 2,
                        height: 113 * 2,
                        rename: 'assets/images/logo@2x.png',
                    },
                    {
                        width: 115 * 5,
                        height: 113 * 5,
                        rename: 'assets/images/logo-large.png',
                    },
                ],
                'assets/images/header--*.jpg': [{ width: 1440 }],
                'assets/images/about-team-*.jpg': [{ width: 360 }],
                'assets/images/about-stichting.jpg': [{ width: 600 }],
                'assets/images/merijn.jpg': [{ width: 700 }],
                'assets/images/pickup10-app-hand.png': [{ width: 300 }],
                'assets/images/plastic-soup.jpg': [{ width: 1024 }],
                'assets/images/plastic-soup-s.jpg': [{ width: 768 }],
                'assets/images/campaign--*.jpg': [{ width: 660 }],
                'assets/images/campaign-content--*': [{ width: 960 }],
                'assets/images/take-action--*.jpg': [{ width: 600 }],
                'assets/logos/*.png': [{ width: 200 }],
            })
        )
        .pipe(gulp.dest(process.env.DIST_DIR));
});
