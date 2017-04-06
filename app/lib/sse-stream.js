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
            
            console.log(event, data);

            this.push('data:' + data + "\n\n");
            callback();
        });
    }

    let streams = new Set();

    return {
        publish(data, {id = null, event = null} = {}) {
            streams.forEach(stream => {
                stream.write({data, id, event});
            });
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