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

            'assets/images/header.jpg' : [
                {
                    width:1440
                }
            ],

            'assets/images/header-s.jpg' : [
                {
                    width:768
                }
            ],

			'assets/images/about-me.jpg' : [
                {
                    width:1440
                }
            ],

            'assets/images/about-me-s.jpg' : [
                {
                    width:768
                }
            ],

			'assets/images/team.jpg' : [
                {
                    width:500
                }
            ],

			'assets/images/about-stichting-wide.jpg' : [
                {
                    width:768
                }
            ],

            'assets/images/merijn.png' : [
                {
                    width:700
                }
            ],

            'assets/images/paddle-board.png' : [
                {
                    width:600
                }
            ],

            'assets/images/plastic-soup.jpg' : [
                {
                    width:1024
                }
            ],

            'assets/images/plastic-soup-s.jpg' : [
                {
                    width:768
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
