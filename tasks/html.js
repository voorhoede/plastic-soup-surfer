const gulp = require('gulp');
const renderContentful = require('../render/lib/render');
const watch = require('gulp-watch');

gulp.task('html', function (cb) {
    renderContentful({
        srcDir : process.env.SRC_DIR,
        viewGlob : process.env.SRC_DIR + "/views/**/*.html",
        contentFul : {
            accessToken : process.env.CONTENTFUL_ACCESS_TOKEN,
            space : process.env.CONTENTFUL_SPACE
        },
        useCache : process.env.NODE_ENV === "development",
        outDir : process.env.DIST_DIR,
        contextIncludes : []
    }).then(cb);
});

gulp.task('html:watch', ['html'], function () {
    return watch(process.env.SRC_DIR  + '/views/**/*.html', () => {
        gulp.start('html');
    });
});