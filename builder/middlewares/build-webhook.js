const auth = require('basic-auth');
const gulp = require('gulp');

require('./gulpfile');

module.exports = async (ctx) => {
    const user = auth(ctx);

    if (!user || user.name != process.env.WEBHOOK_USER || user.pass !== process.env.WEBHOOK_PASS) {
        ctx.throw(401);
    }

    gulp.start('html', () => {
        console.log("done!");
    });
}