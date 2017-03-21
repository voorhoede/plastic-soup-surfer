const Koa = require('koa');
const Router = require('koa-router');
const gulp = require('gulp');

require('./gulpfile');

const app = new Koa();

const mainRouter = new Router();

mainRouter.get('/webhook', ctx => {
    // const user = auth(ctx);

    // if (!user || user.name != process.env.WEBHOOK_USER || user.pass !== process.env.WEBHOOK_PASS) {
    //     ctx.throw(401);
    // }

    gulp.start('html', () => {
        console.log("done!");
    });
});

app.use( mainRouter.routes() );

app.listen(80);