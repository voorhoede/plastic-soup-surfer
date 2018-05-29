require('dotenv').config(__dirname + '/..');

const http = require('http');
const https = require('https');
const Koa = require('koa');
const consistentUrls = require('koa-consistent-urls')
const Router = require('koa-router');
const flash = require('koa-flash-simple');
const session = require('koa-session');
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
    liveStream: require('./lib/koa-sse-stream')(),
    constants: require('./constants'),
    nunjucksEnv: nunjucks.configure('./src', {
        noCache: process.env.NODE_ENV === 'development',
    }),
};

const mainRouter = new Router();

app.use(consistentUrls({
  www: false,
  trailingSlash: false,
}))

mainRouter.redirect('/exploot', '/donate');
mainRouter.redirect('/expedition', '/adventures/source2sea');

//register all the api routers
const apiRouter = new Router();
const { paymentApiClient } = require('./api/donations')(apiRouter, appCtxt);
require('./api/map')(apiRouter, appCtxt);
require('./api/webhook')(apiRouter, appCtxt);
require('./api/social-feed')(apiRouter, appCtxt);
mainRouter.use('/api', apiRouter.routes());

//register the page router
const pagesRouter = new Router();
require('./pages')(pagesRouter, appCtxt);
mainRouter.use('/', pagesRouter.routes());

app.use(xhr()); //adds ctx.xhr

//flash cookie is a cookie which can only be used by the next request (mostly used for error messages)
app.use(session(app));
app.keys = ['9aDxBtRqBaZ7gKBu'];
app.use(flash());

require('./static')(app);

app.use(mainRouter.routes());

const server = app.listen(0, () => {
    const serverAddress = `http://localhost:${server.address().port}`;
    console.info(`Server launched at ${serverAddress}`);

    if (process.env.NODE_ENV === 'development') {
        const browserSync = require('browser-sync');

        browserSync({
            files: ['src/**/*.{html}', 'dist/**/*.{js,css}'],
            online: false,
            open: false,
            proxy: serverAddress,
            ui: false,
        });
    }
});

['SIGINT', 'SIGTERM'].forEach(function(signal) {
    process.on(signal, function() {
        console.info('Closing server');
        paymentApiClient.store.flush();
        server.close(process.exit);
    });
});
