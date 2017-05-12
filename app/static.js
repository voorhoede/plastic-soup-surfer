const Koa = require('koa');
const static = require('koa-static');
const compress = require('koa-compress');
const etag = require('koa-etag');
const mount = require('koa-mount');
const conditional = require('koa-conditional-get');

module.exports = function (app) {
    //compress the text/html text/css and javascript/application mimetypes using gzip
    app.use( compress({
        filter: function (content_type) {
            return /text/i.test(content_type) || /javascript/.test(content_type);
        },
        threshold: 2048,
        flush: require('zlib').Z_SYNC_FLUSH
    }) );

    //static files
    const assetsApp = new Koa();
    assetsApp.use( (ctx, next) => {
        ctx.path = "/assets/" + ctx.path;
        return next();
    });
    assetsApp.use( conditional() ); //works with etag

    const etagInstance = etag();
    assetsApp.use( async (ctx, next) => {
        if(/.*-[0-9a-f]{10}\..*/.test(ctx.path)) { //revisioned files
            await next();
            ctx.set('Cache-Control', 'max-age=31536000'); //immutable cache
        }
        else {
            await etagInstance(ctx, next);
        }
    } );
    assetsApp.use( static(__dirname + "/../dist") );

    app.use( mount('/assets', assetsApp) );
}