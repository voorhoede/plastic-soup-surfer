/**
 * Simple middleware to support sse events
 * 
 * Usage:
 * 
 * const sse = require('koa-sse-stream');
 * 
 * const stream = sse.stream();
 * 
 * app.get('/stream', stream.middleware());
 * 
 * stream.publishJSON({
 *     message : "yo"
 * })
 * 
 */

const through = require('through2');

module.exports = function () {
    function createStream() {
        return through.obj(function (chunk, enc, callback) {
            const {data, id = null, event = null} = chunk;

            if(id) {
                this.push('id:' + id + "\n");
            }

            if(event) {
                this.push('event:' + event + "\n");
            }
            
            this.push('data:' + data + "\n\n");
            callback();
        });
    }

    let streams = new Set();

    return {
        /**
         * Publish the given data to all registered streams
         */
        publish(data, {id = null, event = null} = {}) {
            for (let stream of streams) {
                stream.write({data, id, event});
            }
        },

        /**
         * Same as publish only calls JSON.stringify before publishing
         */
        publishJSON(data, {id = null, event = null} = {}) {
            this.publish(JSON.stringify(data), {id, event});
        },

        middleware() {
            return (ctx, next) => {
                const stream = createStream();
                stream.on('close', () => {
                    streams.delete(stream);
                });

                streams.add( stream );

                ctx.set('content-type', 'text/event-stream');
                ctx.set('cache-control', 'no-cache');
                ctx.body = stream;
            }
        }
    }
}