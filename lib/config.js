/**
 * Created by ued on 2019/8/6.
 */

"use strict";

let path = require('path');
let fs = require('fs');
let minimist = require('minimist');
let args = minimist(process.argv.slice(2));

const CWD = process.cwd();
const SERVE_CONFIG_FILE = 'config.js';
const SERVE_CONFIG_PATH = path.resolve(CWD, args.config || SERVE_CONFIG_FILE);

if (!fs.existsSync(SERVE_CONFIG_PATH)) {
    module.exports = {};
} else {
    module.exports = require(SERVE_CONFIG_PATH);
}
