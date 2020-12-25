#!/usr/bin/env node
const Ftp = require('../src/models/ftp');
const SFtp = require('../src/models/sftp');
const program = require('commander');
const chalk = require('chalk')          // 美化命令行
const {actionType, askAction} = require('../src/models/inquirer_model/index');

program
    .command('connect')
    .description('输入ftp、sftp连接的基本信息来进行连接')
    .option('-d, --default-config [defaultConfig]', '使用默认配置', false)
    .action(async (options) => {
        let type = actionType.connect;
        if (options.defaultConfig) {
            type = actionType.defaultConnect;
        }
        askAction(type);
    });

program
    .command('upload')
    .description('上传文件')
    .requiredOption('-s, --source [source]>', 'source file')
    .requiredOption('-t, --target [target]', 'target path')

    // 返回的options是个数组，按顺序给到
    .action(async (options) => {
        console.log('----- upload options -----', options.source);

        let res = await Ftp.connect();
        if (res.success) {
            console.log('[ftp] connect success');
            let {err} = await Ftp.uploadFile(options.source, options.target)
            if (err) {
                console.log('----- upload failed -----');
                console.log(err);
            } else {
                console.log('----- upload success -----')
            }
            Ftp.exit();
        }
    });

program
    .command('download')
    .description('下载文件')
    .requiredOption('-t, --target [target]', 'target path')

    // 返回的options是个数组，按顺序给到
    .action(async (options) => {
        console.log('----- download options -----', options.target);

        let res = await Ftp.connect();
        if (res.success) {
            console.log('[ftp] connect success');
            let {err} = await Ftp.downloadFile(options.target)
            if (err) {
                console.log('----- download failed -----');
                console.log(err);
            } else {
                console.log('----- download success -----')
            }
            Ftp.exit();
        }
    });

program
    .command('delete')
    .description('删除文件')
    .option('-t, --target [target]', 'target file')
    .option('-f, --folder [folder]', 'folder path')

    // 返回的options是个数组，按顺序给到
    .action(async (options) => {
        console.log('----- delete options -----', options.target);

        let res = await Ftp.connect();
        if (res.success) {
            console.log('[ftp] connect success');
            let {err} = await Ftp.deleteFile(options.target, options.folder)
            if (err) {
                console.log('----- delete failed -----');
                console.log(err);
            } else {
                console.log('----- delete success -----')
            }
            Ftp.exit();
        }
    });

program.parse(process.argv);