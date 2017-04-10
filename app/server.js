require('dotenv').config(__dirname + "/..");

const Koa = require('koa');
const Router = require('koa-router');
const static = require('koa-static');
const flash = require('koa-flash-simple');
const session = require('koa-session');
const fs = require('fs');
const path = require('path');
const assert = require('assert');;
const xhr = require('./lib/koa-xhr');
const contentfulCache = require('./lib/contentful-cache');
const juicerCache = require('./lib/juicer-cache');

juicerCache.startPeriodicUpdate();

const port = parseInt(process.env.PORT, 10) || 8080;

const app = new Koa();

const appCtxt = {
    liveStream : require('./lib/koa-sse-stream')(),
    constants : require('./constants')
}

const mainRouter = new Router();

const apiRouter = new Router();
require('./api/donations')(apiRouter, appCtxt);
require('./api/map')(apiRouter, appCtxt);
require('./api/webhook')(apiRouter, appCtxt);
mainRouter.use("/api", apiRouter.routes());

const pagesRouter = new Router();
require('./pages')(pagesRouter, appCtxt);
mainRouter.use("/", pagesRouter.routes());

app.keys = ['9aDxBtRqBaZ7gKBu'];
app.use( xhr() );
app.use( session(app) );
app.use( flash() );
app.use( mainRouter.routes() );
app.use( static(__dirname + "/../dist") );

app.listen(port, function () {
    if(process.env.NODE_ENV === "development") {
        const browserSync = require('browser-sync');

        // https://ponyfoo.com/articles/a-browsersync-primer#inside-a-node-application
        browserSync({
            files: ['src/**/*.{html}', 'dist/**/*.{js,css}'],
            online: false,
            open: false,
            port: port + 1,
            proxy: 'localhost:' + port,
            ui: false
        });
    }
});