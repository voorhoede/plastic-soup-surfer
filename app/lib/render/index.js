const fork = require('child_process').fork;
const getTemplateData = require('./get-template-data');

let currentRender = Promise.resolve();

function renderInProcess({useContentfulCache = false} = {}) {
    return getTemplateData()
        .then(extraTemplateData => {

            return new Promise((resolve, reject) => {
                const args = {
                    extraTemplateData,
                    useContentfulCache
                }

                console.log(`Render with args ${JSON.stringify(args)}`);

                const proc = fork(__dirname + "/render-process", 
                    Object.keys(args).reduce((prev, key) => {
                        return prev.concat(["--" + key, JSON.stringify(args[key])]);
                    }, [])
                );
                proc.on('close', code => {
                    console.log("Rendering done");
                    code === 0 ? resolve() : reject(new Error("Error when rendering templates"));
                });
            });

        });
}

function timeout(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(reject, ms);
    });
}

exports.addTask = function (options) {
    return currentRender = currentRender
        .then( Promise.race([
            renderInProcess(options),
            timeout(3000)
        ]) );
}