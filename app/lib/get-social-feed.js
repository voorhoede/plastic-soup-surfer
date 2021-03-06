const juicerCache = require('./juicer-cache');

const addRelNoOpener = html =>
    html.replace(/target=("|')_blank("|')/g, 'target="_blank" rel="noopener"');

function offsetIdToIndex(posts, offsetId) {
    if(isNaN(offsetId)) {
        return 0;
    }

    let offsetIndex = posts.findIndex(post => {
        return post.id === offsetId;
    });

    return offsetIndex !== -1 ? offsetIndex : 0;
}

function mapPost(post) {
    return {
        id : post.id,
        body : addRelNoOpener(post.message),
        imageUrl : post.image,
        social : {
            type : post.source.source,
            url  : post.full_url || post.video
        }
    }
}

module.exports = function getSocialFeed (offsetId, limit=100) {
    offsetId = parseInt(offsetId, 10);
    limit = parseInt(limit, 10);

    return juicerCache.get()
        .then(juicer => {
            let posts = juicer.posts.items;

            let offsetIndex = offsetIdToIndex(posts, offsetId);

            let next = null;
            if(offsetIndex + limit + 1 < posts.length) {
                next = posts[offsetIndex + limit + 1].id;
            }

            return {
                posts : posts.slice(offsetIndex, offsetIndex + limit).map(mapPost),
                next
            }
        });
}
