require('dotenv').config(__dirname + "/..");

const Koa = require('koa');
const Router = require('koa-router');
const static = require('koa-static');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const xhr = require('./lib/koa-xhr');
const contentfulCache = require('./lib/contentful-cache');

const port = 8080;

const app = new Koa();

const mainRouter = new Router();

const apiRouter = new Router();
require('./api/donations')(apiRouter);
require('./api/map')(apiRouter);
require('./api/webhook')(apiRouter);
mainRouter.use("/api", apiRouter.routes());

const pagesRouter = new Router();
require('./pages')(pagesRouter);
mainRouter.use("/", pagesRouter.routes());

app.use( xhr() );
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