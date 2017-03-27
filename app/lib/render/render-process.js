const contentful = require('contentful');
const nunjucks = require('nunjucks');
const path = require('path');
const glob = require('glob');
const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));
const writeAtomic = require(__dirname + '/../write-atomic');

//executed as standalone
const argv = require('minimist')(process.argv.slice(1));
const extraTemplateData = argv.extraTemplateData ? JSON.parse(argv.extraTemplateData) : {};

render({
    srcDir : process.env.SRC_DIR,
    viewGlob : process.env.SRC_DIR + "/views/**/*.html",
    contentFul : {
        accessToken : process.env.CONTENTFUL_ACCESS_TOKEN,
        space : process.env.CONTENTFUL_SPACE
    },
    useContentfulCache : !!argv.useContentfulCache,
    extraTemplateData,
    outDir : process.env.DIST_DIR
})
.then(() => process.exit(0))
.catch(e => {
    console.log(e);
    process.exit(1);
});

async function render(config) {
    const {srcDir, useContentfulCache = false, viewGlob, outDir, contentFul, extraTemplateData = {}} = config;

    const client = contentful.createClient(contentFul);

    /**
     * Group the contentful fields by key for easier access
     * @param {*} items 
     */
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
    async function getTemplateData() {

        const contentfulCachePath = path.join(process.env.DATA_DIR, '.contentful_cache');

        let data;

        if(useContentfulCache) {
            console.log('Rendering using contentful cache');

            try {
                const cache = await fs.readFileAsync(contentfulCachePath, 'utf8');
                data = JSON.parse(cache);
            }
            catch(e) {
                if(e.code !== "ENOENT") {
                    throw e;
                }
            }
        }
        else {
            //retrieve the contentful entries (these are not grouped)
            const {items} = await client.getEntries();

            //group by contentType (makes the data easier to query)
            data = group(items);
        }
        
        Object.assign(data, extraTemplateData);

        if(!useContentfulCache) {
            await fs.writeFileAsync(contentfulCachePath, JSON.stringify(data), {encoding : "utf8"});
        }

        return data;
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
        templateData = await getTemplateData(),
        files = await getViewFiles();

    const promises = files.map(filePath => {
        const relativeTemplate = filePath.substr(srcDir.length+1);
        const renderedTemplate = env.render(relativeTemplate, templateData);
        const outPath = path.join(outDir, path.basename(filePath));

        return writeAtomic(outPath, renderedTemplate);
    });

    return Promise.all(promises).then(() => {});
}