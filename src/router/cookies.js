const Router = require('koa-router');
const router = new Router({ prefix: '/cookies' });

// cookies测试
router.get('/', (ctx, next) => {
    // ignore favicon
    if (ctx.path === '/favicon.ico') return;

    let n = ctx.session.views || 0;
    let views = ++n;
    // session默认是保存在cookie中的
    ctx.session = Object.assign(ctx.session, { views })

    ctx.body = ctx.session
});

module.exports = router;