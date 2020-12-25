let fs = require('fs');
let path = require('path');

let multer = require('koa-multer');
let { checkLoginToken } = require('../lib/util');
let { API_PREFIX } = require('../src/util/status_code');

let controlleDir = path.resolve(__dirname, '..') + '/controller';

// 需配置中间件的上传接口
let upload_middlerware_routes = ['/uploadImg', '/saveThumb', '/importWidget'];

let storage = multer.diskStorage({

    //文件保存路径
    destination: function (req, file, cb) {
        cb(null, path.resolve(__dirname, '../static/'));
    },

    //修改文件名称
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split('.');
        cb(null, Date.now() + '.' + fileFormat[fileFormat.length - 1]);
    }
});
let upload = multer({ storage: storage });


/**
 * 添加控制器
 * @param router
 */
function addControllers(router) {

    // 先导入fs模块，然后用readdirSync列出文件

    // 这里可以用sync是因为启动时只运行一次，不存在性能问题:
    let files = fs.readdirSync(controlleDir);

    // 过滤出.js文件
    let jsFiles = files.filter((f) => {
        return f.endsWith('.js');
    });

    for (let f of jsFiles) {
        console.log(`process controller: ${f}...`);
        let mapping = require(controlleDir + '/' + f);
        addMapping(router, mapping);
    }
}

/**
 * 添加路由
 * @param router
 * @param mapping
 */
function addMapping(router, mapping) {
    for (let url in mapping) {
        if (mapping.hasOwnProperty(url)) {
            let controller = mapping[url];
            let opt = url.split(' ');
            let method = opt[0] && opt[0].toLowerCase();
            let path = opt[1];

            if (router[method]) {
                if (upload_middlerware_routes.indexOf(path) !== -1) {
                    router.post(path, upload.single('file'), controller);
                } else {
                    router[method](path, checkLoginToken, controller);
                }

                console.log(`register URL mapping: ${method} ${path}`);
            } else {
                console.log(`invalid URL: ${url}`);
            }
        }
    }
}


module.exports = (dir) => {
    let controllersDir = dir || 'controllers',
        router = require('koa-router')();

    router.prefix(API_PREFIX);

    addControllers(router, controllersDir);

    return router.routes();
};
