let log4js = require('log4js');
let address = require('address');
let appConfig = require('../../config.app');
const currentIP = address.ip();

// %X{ip}，就是用于获取context中ip属性的方法了，ip是前面addContext中的key，这个千万要对应上
// %d 日期，格式-默认是ISO8601，格式选项有：ISO8601，
// %p 日志级别
// %f 文件名的完整路径（enableCallStack: true在类别上必填)
// %h 主机名
// %l 行号（enableCallStack: true在类别上需要)
// 关于pattern的详细参数可参见[log4js的layout](https://log4js-node.github.io/log4js-node/layouts.html)
const ptn = "[%d{yyyy-MM-dd hh:mm:ss}] [%p] [用户名：%X{user}] [用户ip: %X{ip}] [主机名：%h] [%f - %l line]- %m";

log4js.configure({
    appenders: {
        console: {
            type: 'console',
            layout: {
                type: "pattern",
                pattern: ptn
            },
        },
        cheese: {
            type: 'file',
            filename: appConfig.log_path,
            category: 'cheese',
            layout: {
                type: "pattern",
                pattern: ptn
            },
        }
    },
    categories: {

        // 输出级别从低到高 all -> trace -> debug -> info ... -> off
        default: {
            appenders: [
                'console',
                'cheese'
            ],
            level: 'info',
            // 为了文件路径在输出的时候可以正常显示
            enableCallStack: true,
        },

        cheese: {
            appenders: ['cheese', 'console'],

            // 为了文件路径在输出的时候可以正常显示
            enableCallStack: true,
            level: 'all'
        }
    }
});

let logger = log4js.getLogger('cheese');

// 指定输出级别
// logger.level = 'debug';


//  设置自定义字段
logger.addContext('ip', currentIP);
function setUserName(name) {
    logger.addContext('user', name);
}


/**
 * toDo: 后续需要拓展自定义的logger的基础模板
 */

module.exports = {
    logger,
    setUserName
};
