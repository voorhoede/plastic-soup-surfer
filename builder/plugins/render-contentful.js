const contentful = require('contentful');
const through = require('through2');
const nunjucks = require('nunjucks');
const path = require('path');

module.exports = function (...contextIncludes) {
    const client = contentful.createClient({
        space       : process.env.SPACE,
        accessToken : process.env.ACCESS_TOKEN
    });

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

        //retrieve the contentful entries (these are not grouped)
        const {items} = await client.getEntries();

        //group by contentType (makes the data easier to query)
        ctx = group(items);

        //allow each contextInclude to add its own data to the ctx
        await Promise.all( contextIncludes.map(include => include(ctx)) );

        return ctx;
    }

    let env, ctx = null;

    return through.obj(async (file, encoding, callback) => {
        if(!env) {
             env = nunjucks.configure(path.dirname(file.path));
        }

        if(!ctx) {
            ctx = await getContext();
        }

        file = Object.assign(file.clone({contents : false}), {
            contents : new Buffer(env.render(file.path, ctx), "utf8")
        });

        callback(null, file);
    });
}