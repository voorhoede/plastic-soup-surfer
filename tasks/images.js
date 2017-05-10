const gulp = require('gulp');
const responsive = require('gulp-responsive');

gulp.task('images', function() {
	return gulp.src(process.env.SRC_DIR + '/**/*.{png,jpg,jpeg}', {base: process.env.SRC_DIR})
		.pipe(responsive({
            'assets/images/map-overlay-s.png' : [
                {
                    rename : 'assets/images/map-overlay-s@2x.jpg',
                    width  : 750
                },

                {
                    rename : 'assets/images/map-overlay-s.jpg',
                    width  : 375
                }
            ],

            'assets/images/map-overlay-l.png' : [
                {
                    rename : 'assets/images/map-overlay-l.jpg',
                    width  : 928,
                    quality : 90
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

			'assets/images/about-team-merijn.jpg' : [
                {
                    width:360
                }
            ],

			'assets/images/about-team-eelkedekker.jpg' : [
                {
                    width:400
                }
            ],

			'assets/images/about-team-kimvandenanker.jpeg' : [
                {
                    width:400
                }
            ],

			'assets/images/about-team-martine.jpg' : [
                {
                    width:400
                }
            ],

			'assets/images/about-stichting.jpg' : [
                {
                    width:600
                }
            ],

            'assets/images/merijn.jpg' : [
                {
                    width:700
                }
            ],

            'assets/images/paddle-board.jpg' : [
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

            'assets/logos/canoe.png' : [
                {
                    width:200
                }
            ],

            'assets/logos/deutsche-umwelthilfe.png' : [
                {
                    width:200
                }
            ],

            'assets/logos/diezijnvaardig.png' : [
                {
                    width:200
                }
            ],

            'assets/logos/edosmid.png' : [
                {
                    width:200
                }
            ],

            'assets/logos/horchner.png' : [
                {
                    width:200
                }
            ],

            'assets/logos/ivn.png' : [
                {
                    width:200
                }
            ],

            'assets/logos/plasticsoup.png' : [
                {
                    width:200
                }
            ],

            'assets/logos/sciencedelft.png' : [
                {
                    width:200
                }
            ],

            'assets/logos/starboard.png' : [
                {
                    width:200
                }
            ],

            'assets/logos/surfrider.png' : [
                {
                    width:200
                }
            ],

            'assets/logos/tomra.png' : [
                {
                    width:200
                }
            ],

            'assets/logos/vaude.png' : [
                {
                    width:200
                }
            ],

            'assets/logos/watersportverbond.png' : [
                {
                    width:200
                }
            ],

            'assets/logos/zwerfinator.png' : [
                {
                    width:200
                }
            ],

            'assets/logos/stichting-de-noordzee.png' : [
                {
                    width:200
                }
            ],

            'assets/logos/unitid.png' : [
                {
                    width:200
                }
            ],

            'assets/logos/de-voorhoede.png' : [
                {
                    width:200
                }
            ],

            'assets/logos/bebr.png' : [
                {
                    width:200
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
                },

				{
					width : 127 * 5,
                    height : 123 * 5,
					rename : 'assets/images/logo-large.png'
				}
            ]
        }))
		.pipe(gulp.dest(process.env.DIST_DIR));
});
