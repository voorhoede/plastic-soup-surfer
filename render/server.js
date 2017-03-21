const Koa = require('koa');
const Router = require('koa-router');
const gulp = require('gulp');

require('./gulpfile');

const app = new Koa();

app.use( ctx => {
    gulp.start('html', err => {
        console.log(err);
    });

    ctx.body = "Done";
} );

app.listen(80);