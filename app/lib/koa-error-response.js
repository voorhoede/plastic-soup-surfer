/**
 * Simple middleware to display errors as json
 * 
 * Usage:
 * 
 * app.get('/', errors.middleware(), ctx => {
 *     throw errors.UserError("OMG error!");
 * })
 *   
 */

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

//a user error (the user has send a wrong request)
exports.UserError = statusError(400);

//a something went really wrong error :-(
exports.InternalError = statusError(500);

exports.middleware = function () {
    return async function (ctx, next) {
        try {
            await next();
        }
        catch(e) {

            //for errors which are not UserError or InternalError...rethrow
            if(!e.status) {
                throw e;
            }

            //for non ajax errors we put the error in a flash cookie and redirect to the previous page
            if(!isAjax(ctx)) {
                //TODO show error page here
                ctx.flash.set({error : e.message});
                return ctx.redirect(ctx.headers.referer);
            }

            //for ajax errors we display the error as json
            ctx.status = e.status;
            ctx.type = "application/json";
            ctx.body = JSON.stringify({error : e.message});
        }
    }
}