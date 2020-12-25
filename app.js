let Koa = require('koa');
let app = new Koa();
let fs = require('fs');
// let router = require('koa-router');
let routes = require('./routes/index');
let bodyParser = require('koa-bodyparser');
let cacheControl = require('koa-cache-control');
let cors = require('koa2-cors');
let staticRouter = require('koa-static-router');
let staticFiles = require('./middleware/static_files');

let logger = require('./src/util/logger');
let appConfig = require('./config.app');
let { API_PREFIX } = require('src/util/status_code');

app.use(staticRouter([{
    dir: 'widgets',
    router: API_PREFIX + 'resource/widgets/'
}, {
    dir: 'static',
    router: API_PREFIX + 'resource/static/'
}, {
    dir: 'data',
    router: API_PREFIX + 'resource/data/'
}]));

app.use(staticFiles('/static/', __dirname + '/static'));

app.use(cacheControl({
    noCache: true
}));

app.use(cors({
    allowMethods: ['GET', 'POST']
}));
app.use(bodyParser());

// 加载路由
app.use(routes());

app.listen(appConfig.server_port);
logger.info(`[custom-screen]服务已启动，监听端口5001`);
