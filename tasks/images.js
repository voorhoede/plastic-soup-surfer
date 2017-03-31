const gulp = require('gulp');
const responsive = require('gulp-responsive');

gulp.task('images', function() {
	return gulp.src(process.env.SRC_DIR + '/**/*.{png,jpg,jpeg}', {base: process.env.SRC_DIR})
		.pipe(responsive({
            'assets/images/map-overlay.png' : [
                {
                    width:1860
                }
            ],

            'assets/images/logo.png' : [
                {   
                    width : 127,
                    height : 123
                },

                {
                    width : 127 * 2,
                    height : 123 * 2,
                    rename : 'assets/images/logo@2x.png'
                }
            ]
        }))
		.pipe(gulp.dest(process.env.DIST_DIR));
});