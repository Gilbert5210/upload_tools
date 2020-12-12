/**
 * Created by ued on 2019/8/6.
 */

'use strict';
let path = require('path');
const SERVE_CONFIG = require('./config');

function getserveConfig (key, defaultValue, ...args) {
    let ret = defaultValue;
    let serveConfig = SERVE_CONFIG;

    key.split('.').forEach(item => {
        if (serveConfig && typeof serveConfig === 'object') {
            serveConfig = serveConfig[item];
        }
    });
    if (typeof serveConfig === 'function') {
        ret = serveConfig(process.env.NODE_ENV, defaultValue, path.resolve(__dirname, '../node_modules'), ...args);
    } else if (typeof serveConfig !== 'undefined') {
        ret = serveConfig;
    }
    return ret;
}

module.exports = getserveConfig;
