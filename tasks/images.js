const gulp = require('gulp');
const responsive = require('gulp-responsive');

gulp.task('images', function() {
	return gulp.src(process.env.SRC_DIR + '/**/*.{png,jpg,jpeg}',
        { base: process.env.SRC_DIR, since: gulp.lastRun('images') }
    )
		.pipe(responsive({
            'assets/images/header.jpg' : [
                {
                    width:1440
                }
            ],

            'assets/images/header-home.jpg' : [
              {
                  width:1440
              }
            ],

			'assets/images/about-team-merijn.jpg' : [
                {
                    width:360
                }
            ],

            'assets/images/about-team-dalinde-theunissen.jpg': [{ width: 400 }],

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

            'assets/images/pickup10-app-hand.png' : [{ width: 300 }],

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

            'assets/images/adventure--bailiffs.jpg' : [{ width: 660 }],
            'assets/images/adventure--message-on-a-bottle.jpg' : [{ width: 660 }],
            'assets/images/adventure--plastic-hunters.jpg' : [{ width: 660 }],
            'assets/images/adventure--plastic-soup-board.jpg' : [{ width: 660 }],
            'assets/images/adventure--resolution.jpg' : [{ width: 660 }],
            'assets/images/adventure--source-to-sea.jpg' : [{ width: 660 }],
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

            'assets/logos/hike-one.png' : [
                {
                    width:200
                }
            ],

            'assets/logos/bebr.png' : [
                {
                    width:200
                }
            ],

            'assets/logos/mollie.png' : [
                {
                    width:200
                }
            ],

            'assets/logos/national-geographic.png' : [{ width: 200 }],
            'assets/logos/natuur-en-milieu.png' : [{ width: 200 }],

            'assets/images/logo.png' : [
                {
                    width : 115,
                    height : 113
                },

                {
                    width : 115 * 2,
                    height : 113 * 2,
                    rename : 'assets/images/logo@2x.png'
                },

				{
					width : 115 * 5,
                    height : 113 * 5,
					rename : 'assets/images/logo-large.png'
				}
            ],

			'assets/logos/fujitsu.png' : [
                {
                    width:200
                }
            ],

			'assets/logos/technolyt.png' : [
                {
                    width:200
                }
            ],

			'assets/logos/adessium.png' : [
                {
                    width:200
                }
            ],

			'assets/logos/entropy-resins.png' : [
                {
                    width:200
                }
            ],

			'assets/logos/recycling-netwerk.png' : [
                {
                    width:200
                }
            ],

			'assets/logos/garmin-logo.png': [{ width: 200 }],
			'assets/logos/ggn.png': [{ width: 200 }],
			'assets/logos/google.png': [{ width: 200 }],
			'assets/logos/water-ranger.png': [{ width: 200 }],
        }))
		.pipe(gulp.dest(process.env.DIST_DIR));
});
