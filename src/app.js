const koa = require('koa');
const bodyParser = require('koa-bodyparser')
const session = require('koa-session');
const router = require('./router/index');
const DataBaseConnector = require('./db/connect')
const { cookieConfig } = require('./config')

const app = new koa();
app.keys = ['some secret hurr']; // session用到的

DataBaseConnector.openRedis() 
DataBaseConnector.openMongoDB()

app.use(session(cookieConfig, app));
app.use(bodyParser())
app.use(router.routes())

app.listen(3001, () => {
    console.log('server is running at http://localhost:3001');
});