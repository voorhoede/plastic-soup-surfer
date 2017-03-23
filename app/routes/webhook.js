const fork = require('child_process').fork;
const auth = require('koa-basic-auth');
const writeAtomic = require('../../lib/write-atomic');
const readPhase = require('../../lib/read-phase');

module.exports = function (router) {
    let currentRender = Promise.resolve(), currentRenderCount = 0;

    const authMiddleware = auth({
        name : process.env.WEBHOOK_USER, 
        pass : process.env.WEBHOOK_PASS, 
    });

    function renderInProcess() {
        return new Promise((resolve, reject) => {
            currentRenderCount++;

            const proc = fork(__dirname + "/../../lib/render", []);
            proc.on('close', code => {
                currentRenderCount--;
                code === 0 ? resolve() : reject();
            });

            resolve();
        });
    }

    function timeout(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(reject, ms);
        });
    }

    router.use(authMiddleware);

    router.get('/phase', async (ctx) => {
        let {p : newPhase = null} = ctx.query || {};
        
        newPhase = parseInt(newPhase, 10);
        let currentPhase = await readPhase();    
    
        if([0,1,2].indexOf(newPhase) === -1) {
            ctx.body = currentPhase;
            return;
        }

        if(currentPhase !== newPhase) {
            await writeAtomic(process.env.DATA_DIR + "/phase", newPhase);

            renderInProcess();
        }

        ctx.body = newPhase;
    });

    router.get('/contentful', ctx => {

        if(currentRenderCount >= 10) {
            ctx.status = 500;
            ctx.body = "Too much renders in queue";
            return;
        }

        currentRender = currentRender
            .then( Promise.race([
                renderInProcess(),
                timeout(10000)
            ]) )
            .then(() => {
                console.log('render done!');
            })
            .catch(e => {
                console.log(e);
            });

        ctx.body = "Done";
    })
}