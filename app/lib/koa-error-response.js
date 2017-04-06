
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

exports.UserError = statusError(400);
exports.InternalError = statusError(500);

exports.middleware = function () {
    return async function (ctx, next) {
        try {
            await next();
        }
        catch(e) {
            if(!e.status) {
                throw e;
            }

            if(!isAjax(ctx)) {
                //TODO show error page here
                ctx.flash.set({error : e.message});
                return ctx.redirect(ctx.headers.referer);
            }

            ctx.status = e.status;
            ctx.type = "application/json";
            ctx.body = JSON.stringify({error : e.message});
        }
    }
}