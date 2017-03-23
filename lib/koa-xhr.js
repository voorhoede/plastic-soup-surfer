

module.exports = function xhr() {
  return async function xhr(ctx, next) {
    ctx.state.xhr = (ctx.request.get('X-Requested-With') === 'XMLHttpRequest');
    await next();
  }
};