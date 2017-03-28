require('dotenv').config(__dirname + "/..");

const Koa = require('koa');
const Router = require('koa-router');
const static = require('koa-static');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const xhr = require('./lib/koa-xhr');

const app = new Koa();

const mainRouter = new Router();

function addRoutes(dir, router) {
    fs.readdirSync(dir).forEach(file => {
        if(path.extname(file) !== ".js") {
            return;
        }

        const name = path.basename(file, ".js");
        const module = require(`${dir}/${file}`);

        assert.ok(typeof module === "function", "Route should be a function");

        module(router);

        console.log(`register route ${name}`);
    });
}

const apiRouter = new Router();
addRoutes(__dirname + "/api", apiRouter);
mainRouter.use("/api", apiRouter.routes());

const pagesRouter = new Router();
addRoutes(__dirname + "/pages", pagesRouter);
mainRouter.use("/", pagesRouter.routes());

app.use( xhr() );
app.use( mainRouter.routes() );
app.use( static(__dirname + "/../dist") );

app.listen(8080);