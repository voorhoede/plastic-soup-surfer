const marked = require('marked');
const nunjucks = require('nunjucks');

const customRenderer = new marked.Renderer();

customRenderer.link = function(href, title, text) {
    let titleAttr = "";
    if(title) {
        titleAttr = `title="${title}"`;
    }

    let targetAttr = "";
    if(/^https?:\/\//.test(href)) {
        targetAttr = `target="_blank" rel="noopener"`;
    }

    return `<a href="${href}" ${targetAttr} ${titleAttr}>${text}</a>`;
};

marked.setOptions({
    renderer : customRenderer
});

module.exports = function register(env) {
    env.addFilter('md', function (str) {
        return new nunjucks.runtime.SafeString( marked(str) );
    });
}
