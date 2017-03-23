const contentful = require('contentful');
const nunjucks = require('nunjucks');
const path = require('path');
const glob = require('glob');
const fs = require('fs');
const writeFileAtomic = require('write-file-atomic');

module.exports = async function (config) {
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

        //quick and dirty caching for dev environment
        if(useCache && fs.existsSync('./.contentful_cache')) {
            console.log("Got template data from cache");
            return JSON.parse( fs.readFileSync('./.contentful_cache', "utf8") );
        }

        //retrieve the contentful entries (these are not grouped)
        const {items} = await client.getEntries();

        //group by contentType (makes the data easier to query)
        let ctx = group(items);

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

        return new Promise((resolve, reject) => {
            console.log(`Writing ${outPath}`);

            writeFileAtomic(outPath, renderedTemplate, err => {
                if(err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            })
        });
    });

    return Promise.all(promises).then(() => {});
}