
function isAjax(ctx) {
    return typeof ctx.headers['x-requested-with'] !== "undefined";
}

function statusError(status) {
    return function (msg) {
        let err = new Error(msg);
        err.status = status;
        return err;
    }
}

module.UserError = statusError(400);
module.InternalError = statusError(500);

exports.middleware = function () {
    return async function (ctx, next) {
        try {
            await next();
        }
        catch(e) {
            if(!e.status) {
                throw e;
            }

            console.log(e);

            if(!isAjax(ctx)) {
                //TODO show error page here
                return ctx.redirect(ctx.headers.referer);
            }

            ctx.status = e.status;
            ctx.type = "application/json";
            ctx.body = JSON.stringify({error : e.message});
        }
    }
}