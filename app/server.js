const Koa = require('koa');
const Router = require('koa-router');
const json = require('koa-json');

const app = new Koa();

const mainRouter = new Router();

const payments = new Router();
payments.post('/add', ctx => {
    ctx.body = "response from app";
});

mainRouter.use('/payments', json({pretty : false, param : 'pretty'}), payments.routes());

app.use( mainRouter.routes() );

app.listen(80);