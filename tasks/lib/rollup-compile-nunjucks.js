const path = require('path');
const nunjucks = require('nunjucks');

module.exports = function () {
    let codes = Object.create(null);

    return {
        name : 'nunjucks-compile',

        transform(source, id) {
            if(path.extname(id) !== ".html") {
                return null;
            }

            const name = path.basename(id, ".html");

            const tpl = nunjucks.precompileString(source, {
                name,
                asFunction : true
            });

            return `
            ${tpl}
            export default window.nunjucksPrecompiled['${name}'].root;
            `;
        }
    }
}