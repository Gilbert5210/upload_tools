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

// let logMaster = require('log-master');

let logger = require('./lib/logger');
let appConfig = require('./config.app');
let { API_PREFIX } = require('./lib/status_code');

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

// TODO 暂时不做切割，SIP后台log已支持
// 新增日志分割
// logMaster.split({
//     from: {
//         'app': appConfig.log_path
//     },
//     Suffix: ['.log'],
//     to: appConfig.log_path,
//     Interval: 1000 * 60 * 60 * 24,
//     timeFormat: 'yyyyMMddHHmm',
//     startTime: '23:59'
// });

// 校验保存大屏数据目录是否存在，不存在则创建
// 

app.listen(appConfig.server_port);
logger.info(`[custom-screen]服务已启动，监听端口5001`);
