let log4js = require('log4js');

let appConfig = require('../config.app');

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
logger.level = 'info';

/**
 * toDo: 后续需要拓展自定义的logger的基础模板
 */

module.exports = logger;
