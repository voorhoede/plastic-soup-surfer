const fork = require('child_process').fork;
const auth = require('koa-basic-auth');
const writeAtomic = require('../lib/write-atomic');
const renderQueue = require('../lib/render');
const db = require('../lib/db');

module.exports = function (router) {
    const authMiddleware = auth({
        name : process.env.WEBHOOK_USER, 
        pass : process.env.WEBHOOK_PASS, 
    });

    router.use(authMiddleware);

    router.get('/phase', async (ctx) => {
        let {p : newPhase = null} = ctx.query || {};
        
        newPhase = parseInt(newPhase, 10);
        let currentPhase = await db.getAsync('phase').catch(() => 0);    
    
        if([0,1,2].indexOf(newPhase) === -1) {
            ctx.body = currentPhase;
            return;
        }

        if(currentPhase !== newPhase) {
            await db.putAsync('phase', newPhase);

            renderQueue.addTask({useContentfulCache : false});
        }

        ctx.body = newPhase;
    });

    router.get('/contentful', ctx => {
        let {cache = false} = ctx.query || {};

        renderQueue.addTask({useContentfulCache : !!cache});

        ctx.body = "Rendering done";
    });
}