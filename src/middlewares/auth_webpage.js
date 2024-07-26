module.exports = async function (ctx, next) {

  // console.log(ctx.session)

  await next()
}
