#!/usr/bin/env node
const Ftp = require('../models/ftp');
const program = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk')          // 美化命令行

async function connectFun (answers) {
    // 开始真正执行内部命令
    let res = await Ftp.connect(answers);

    if (res) {
        let fileList = await Ftp.getFileList();
        console.log('当前文件列表：', fileList.length);
        console.dir(fileList);
    }
    Ftp.exit();
}

program
    .command('ftp connect')
    .description('输入ftp连接的基本信息来进行连接')
    .option('-d, --default-config [defaultConfig]', 'ftp连接默认配置', false)
    .action((options) => {

        if (options.defaultConfig) {
            connectFun()
        }

        var config = Object.assign({
            host: '',
            port: '',
            user: '',
            password: '',
            root: '',
            files: []
        }, options);
        let promps = [];

        if(config.host === '') {
            promps.push({
                type: 'input',
                name: 'host',
                message: '请输入ftp地址',
                validate: function (input){
                    if(!input) {
                        return '不能为空'
                    }
                    return true
                }
            })
        }

        if(config.port === '') {
            promps.push({
                type: 'input',
                name: 'port',
                message: '请输入端口号（默认使用21）',
                default: 21
            })
        }

        if(config.user !== 'string') {
            promps.push({
                type: 'input',
                name: 'user',
                message: '请输入用户名',
                validate: function (input){
                    if(!input) {
                        return '不能为空'
                    }
                    return true
                }
            })
        }

        if(config.password === '') {
            promps.push({
                type: 'password',
                name: 'password',
                message: '请输入密码',
                validate: function (input){
                    if(!input) {
                        return '不能为空'
                    }
                    return true
                }
            })
        }

        //  最终结果展示
        inquirer.prompt(promps).then(function (answers) {
            console.log('你输入的内容是：', answers)

            connectFun(answers);
        })
    });

program
    .command('ftp upload')
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
    .command('ftp download')
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
    .command('ftp delete')
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

// ...



// 以下为sftp命令的声明
program
    .command('sftp connect')
    .description('输入ftp连接的基本信息来进行连接')
    .option('-d, --default-config [defaultConfig]', 'ftp连接默认配置', false)
    .action((options) => {

        if (options.defaultConfig) {
            connectFun()
        }

        var config = Object.assign({
            host: '',
            port: '',
            user: '',
            password: '',
            root: '',
            files: []
        }, options);
        let promps = [];

        if(config.host === '') {
            promps.push({
                type: 'input',
                name: 'host',
                message: '请输入ftp地址',
                validate: function (input){
                    if(!input) {
                        return '不能为空'
                    }
                    return true
                }
            })
        }

        if(config.port === '') {
            promps.push({
                type: 'input',
                name: 'port',
                message: '请输入端口号（默认使用21）',
                default: 21
            })
        }

        if(config.user !== 'string') {
            promps.push({
                type: 'input',
                name: 'user',
                message: '请输入用户名',
                validate: function (input){
                    if(!input) {
                        return '不能为空'
                    }
                    return true
                }
            })
        }

        if(config.password === '') {
            promps.push({
                type: 'password',
                name: 'password',
                message: '请输入密码',
                validate: function (input){
                    if(!input) {
                        return '不能为空'
                    }
                    return true
                }
            })
        }

        //  最终结果展示
        inquirer.prompt(promps).then(function (answers) {
            console.log('你输入的内容是：', answers)

            connectFun(answers);
        })
    });


program.parse(process.argv);