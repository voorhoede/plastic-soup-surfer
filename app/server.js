require('dotenv').config(__dirname + "/..");

const http = require('http');
const https = require('https');
const Koa = require('koa');
const Router = require('koa-router');
const static = require('koa-static');
const flash = require('koa-flash-simple');
const session = require('koa-session');
const send = require('koa-send');
const compress = require('koa-compress');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const xhr = require('./lib/koa-xhr');
const contentfulCache = require('./lib/contentful-cache');
const juicerCache = require('./lib/juicer-cache');
const nunjucks = require('nunjucks');

//we cache the juicer feed periodically (every 5 minutes) because juicer tends to be down a lot :-( 
//and caching the feed makes sure that we always have something to display (even though it might be a older feed)
juicerCache.startPeriodicUpdate();

const app = new Koa();

const appCtxt = {
    liveStream : require('./lib/koa-sse-stream')(),
    constants : require('./constants'),
    nunjucksEnv : nunjucks.configure("./src", {
        noCache : process.env.NODE_ENV === "development"
    })
}

const mainRouter = new Router();

//register all the api routers
const apiRouter = new Router();
require('./api/donations')(apiRouter, appCtxt);
require('./api/map')(apiRouter, appCtxt);
require('./api/webhook')(apiRouter, appCtxt);
require('./api/social-feed')(apiRouter, appCtxt);
mainRouter.use("/api", apiRouter.routes());

//register the page router
const pagesRouter = new Router();
require('./pages')(pagesRouter, appCtxt);
mainRouter.use('/', pagesRouter.routes());

//compress the text/html text/css and javascript/application mimetypes using gzip
app.use( compress({
    filter: function (content_type) {
        return /text/i.test(content_type) || /javascript/.test(content_type);
    },
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
}) );

app.use( xhr() ); //adds ctx.xhr

//flash cookie is a cookie which can only be used by the next request (mostly used for error messages)
app.use( session(app) );
app.keys = ['9aDxBtRqBaZ7gKBu'];
app.use( flash() );

app.use( static(__dirname + "/../dist") );
app.use( mainRouter.routes() );

const httpPort = parseInt(process.env.PORT, 10) || 8080;
const httpServer = http.createServer(app.callback());
httpServer.listen(httpPort, function () {
    if(process.env.NODE_ENV === "development") {
        const browserSync = require('browser-sync');

        // https://ponyfoo.com/articles/a-browsersync-primer#inside-a-node-application
        browserSync({
            files: ['src/**/*.{html}', 'dist/**/*.{js,css}'],
            online: false,
            open: false,
            port: httpPort + 1,
            proxy: 'localhost:' + httpPort,
            ui: false
        });
    }
});

if(process.env.NODE_ENV !== "development") {
    const httpsServer = https.createServer({
            key : fs.readFileSync(path.join(process.env.SSL_PATH, 'privkey.pem')),
            cert: fs.readFileSync(path.join(process.env.SSL_PATH, 'fullchain.pem'))
    }, app.callback());

    httpsServer.listen(443);
}