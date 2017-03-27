const gulp = require('gulp');
const watch = require('gulp-watch');
const http = require('http');
const axios = require('axios');

gulp.task('html', function (cb) {
    axios.request({
        url : '/webhook/contentful',
        params : {
            cache : true
        },
        method : "GET",
        auth : {
            username : process.env.WEBHOOK_USER,
            password : process.env.WEBHOOK_PASS
        }
    })
    .then(res => {
        console.log(res.data);
        cb();
    });
});

gulp.task('html:watch', ['html'], function () {
    return watch(process.env.SRC_DIR  + '/**/*.html', () => {
        gulp.start('html');
    });
});