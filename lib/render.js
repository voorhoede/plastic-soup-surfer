const contentful = require('contentful');
const nunjucks = require('nunjucks');
const path = require('path');
const glob = require('glob');
const fs = require('fs');
const readPhase = require('./read-phase');
const writeAtomic = require('./write-atomic');

async function render(config) {
    const {srcDir, useCache = false, viewGlob, outDir, contentFul, contextIncludes = []} = config;

    const client = contentful.createClient(contentFul);

    function group(items) {
        let grouped = {};
        for(let item of items) {
            const {sys : {contentType : {sys : {id}}}} = item;
            grouped.hasOwnProperty(id)
                ? grouped[id].push(item)
                : (grouped[id] = [item]);
        }

        return grouped;
    }

    /**
     * Initializes the context which will be passed to the templates
     * (Note that all templates will receive the same context)
     */
    async function getContext() {

        const phase = await readPhase();

        console.log(`current phase: ${phase}`);

        //quick and dirty caching for dev environment
        if(useCache && fs.existsSync('./.contentful_cache')) {
            console.log("Got template data from cache");
            return Object.assign(JSON.parse( fs.readFileSync('./.contentful_cache', "utf8") ), {phase});
        }

        //retrieve the contentful entries (these are not grouped)
        const {items} = await client.getEntries();

        //group by contentType (makes the data easier to query)
        let ctx = group(items);

        ctx.phase = phase;

        //allow each contextInclude to add its own data to the ctx
        await Promise.all( contextIncludes.map(include => include(ctx)) );

        //quick and dirty caching for dev environment
        if(useCache) {
            fs.writeFileSync('./.contentful_cache', JSON.stringify(ctx), {encoding : "utf8"});
        }

        return ctx;
    }

    /**
     * Retrieve all the view files (excluding those beginning with _)
     */
    async function getViewFiles() {
        return new Promise((resolve, reject) => {
            glob(viewGlob, {ignore : ['**/_*/**', '**/_*']}, function (err, files) {
                if(err) {
                    reject();
                }
                else {
                    resolve(files);
                }
            });
        })
    }

    let env = nunjucks.configure(srcDir), 
        ctx = await getContext(),
        files = await getViewFiles();

    const promises = files.map(filePath => {
        const relativeTemplate = filePath.substr(srcDir.length+1);
        const renderedTemplate = env.render(relativeTemplate, ctx);
        const outPath = path.join(outDir, path.basename(filePath));

        return writeAtomic(outPath, renderedTemplate);
    });

    return Promise.all(promises).then(() => {});
}

module.exports = render;

//executed as standalone
if(require.main === module) {
    render({
        srcDir : process.env.SRC_DIR,
        viewGlob : process.env.SRC_DIR + "/views/**/*.html",
        contentFul : {
            accessToken : process.env.CONTENTFUL_ACCESS_TOKEN,
            space : process.env.CONTENTFUL_SPACE
        },
        useCache : process.env.NODE_ENV === "development",
        outDir : process.env.DIST_DIR,
        contextIncludes : []
    })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}