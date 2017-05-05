const gulp = require('gulp');
const responsive = require('gulp-responsive');

gulp.task('images', function() {
	return gulp.src(process.env.SRC_DIR + '/**/*.{png,jpg,jpeg}', {base: process.env.SRC_DIR})
		.pipe(responsive({
            'assets/images/map-overlay-s.jpg' : [
                {
                    rename : 'assets/images/map-overlay-s@2x.jpg',
                    width  : 750
                },

                {
                    rename : 'assets/images/map-overlay-s.jpg',
                    width  : 375
                }
            ],

            'assets/images/map-overlay-l.jpg' : [
                {
                    rename : 'assets/images/map-overlay-l.jpg',
                    width  : 928
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

			'assets/images/about-stichting.jpg' : [
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

            'assets/images/adventure--message-on-a-bottle.jpg' : [
                {
                    width:660
                }
            ],

            'assets/images/adventure--plastic-hunters.jpg' : [
                {
                    width:660
                }
            ],

            'assets/images/adventure--plastic-soup-board.jpg' : [
                {
                    width:660
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
