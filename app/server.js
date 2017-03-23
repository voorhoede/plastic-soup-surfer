const Koa = require('koa');
const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const xhr = require('../lib/koa-xhr');

const app = new Koa();

const mainRouter = new Router();

fs.readdirSync(__dirname + "/routes").forEach(file => {
    if(path.extname(file) !== ".js") {
        return;
    }

    const name = path.basename(file, ".js");
    const module = require(`${__dirname}/routes/${file}`);

    assert.ok(typeof module === "function", "Route should be a function");

    const router = new Router();
    module(router);

    console.log(`register route ${name}`);

    mainRouter.use("/" + name, router.routes());
});

app.use( xhr() );
app.use( mainRouter.routes() );

app.use(ctx => {
    ctx.body = "ok";
});

app.listen(80);