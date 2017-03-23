const Koa = require('koa');
const Router = require('koa-router');
const render = require('./lib/render');

const app = new Koa();

app.use( ctx => {
    render({
        srcDir : process.env.SRC_DIR,
        viewGlob : process.env.SRC_DIR + "/views/**/*.html",
        contentFul : {
            accessToken : process.env.CONTENTFUL_ACCESS_TOKEN,
            space : process.env.CONTENTFUL_SPACE
        },
        outDir : process.env.DIST_DIR,
        contextIncludes : []
    });

    ctx.body = "Done";
} );

app.listen(80);