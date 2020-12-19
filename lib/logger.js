let log4js = require('log4js');
let address = require('address');
let appConfig = require('../config.app');
const currentIP = address.ip();

log4js.configure({
    appenders: {
        console: {
            type: 'console'
        },
        cheese: {
            type: 'file',
            filename: appConfig.log_path,
            category: 'cheese'
        }
    },
    categories: {
        default: {
            appenders: [
                'console',
                'cheese'
            ],
            level: 'all'
        }
    }
});

let logger = log4js.getLogger('cheese');

// 指定输出级别
logger.level = 'debug';

let loggerKey = ['trace', 'debug', 'info', 'warn', 'error'];

let customLogger = {};

// 简单的重写方法
loggerKey.forEach(keyWord => {
    customLogger[keyWord] = (user='admin', content) => {
        let resultText = `IP-${currentIP} username-${user}: ${content}`;
        return logger[keyWord](resultText);
    }
})


/**
 * toDo: 后续需要拓展自定义的logger的基础模板
 */

module.exports = customLogger;
