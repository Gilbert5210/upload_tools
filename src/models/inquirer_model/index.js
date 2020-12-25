/**
 * 封装了交互式命令的事件映射
 */

const inquirer = require('inquirer');
const Ftp = require('../ftp');
const SFtp = require('../sftp');

let Client = '';

const serveMapping = {
    ftp: Ftp,
    sftp: SFtp
};

let reActionKey = ['ls', 'upload', 'download', 'delete', 'logout'];
let allowBlankValidate = (input, key) => {
    if(!input) {
        return `${key}不能为空`
    }

    return true;
}


let actionType = {
    action: 'action',
    connect: 'connect',
    defaultConnect: 'defaultConnect',
    ls: 'ls',
    upload: 'upload',
    download: 'download',
    deleteFile: 'deleteFile',
    logout: 'logout'
};

let promptListMapping = {
    action: [
        {
            type: 'list',
            name: 'actionKey',
            choices: reActionKey,
            message: `请输入需要执行的操作(${reActionKey.join('|')})`
        }
    ],
    defaultConnect: [{
        type: 'list',
        message: '请选择连接类型:',
        name: 'connectType',
        choices: [
            "ftp",
            "sftp"
        ]
    }],
    connect: [
        {
            type: 'list',
            message: '请选择连接类型:',
            name: 'connectType',
            choices: [
                "ftp",
                "sftp"
            ]
        },
        {
            type: 'input',
            name: 'host',
            message: '请输入host地址',
            validate: (input) => {
                return allowBlankValidate(input, 'host')
            }
        },
        {
            type: 'input',
            name: 'port',
            message: '请输入端口号（默认使用21）',
            default: 21,
            validate: (input) => {
                return allowBlankValidate(input, 'port')
            }
        },
        {
            type: 'input',
            name: 'user',
            message: '请输入用户名',
            validate: (input) => {
                return allowBlankValidate(input, 'user')
            }
        },
        {
            type: 'password',
            name: 'password',
            message: '请输入密码',
            validate: (input) => {
                return allowBlankValidate(input, 'password')
            }
        }
    ],
    ls: [{
            type: 'input',
            name: 'folderPath',
            message: '请输入文件夹路径',
            validate: (input) => {
                return allowBlankValidate(input, 'folderath')
            }
        }
    ],
    upload: [
        {
            type: 'list',
            message: '请选择连接类型:',
            name: 'uploadType',
            choices: [
                'parallel',       // 并行
                'serial'          // 串行
            ]
        },
        {
            type: 'input',
            name: 'source',
            message: '请输入需要上传的文件夹、文件路径',
            validate: (input) => {
                return allowBlankValidate(input, 'source')
            }
        },
        {
            type: 'input',
            name: 'target',
            message: '请输入目标地址',
            validate: (input) => {
                return allowBlankValidate(input, 'target')
            }
        },
    ],
    download: [{
        type: 'input',
        name: 'target',
        message: '请输入你需要下载的文件夹、文件名路径',
        validate: (input) => {
            return allowBlankValidate(input, 'target')
        }
    }],
    deleteFile: [{
        type: 'input',
        name: 'target',
        message: '请输入你需要删除的文件夹、文件名路径',
        validate: (input) => {
            return allowBlankValidate(input, 'target')
        }
    }]
}

async function connect (answers) {
    let Serve = serveMapping[answers.connectType];

    Client = new Serve(answers);
    // 开始真正执行内部命令
    await Client.connect();
    askAction(actionType.action);
}


async function list (answers) {
    let path = answers.folderPath;
    let list = await Client.getFileList(path);

    console.log('文件数量：', list.length);

    askAction(actionType.action);
}



async function upload (answers) {
    await Client.uploadFile(answers.source, answers.target, answers.uploadType)

    askAction(actionType.action);
}


async function download (answers) {


    askAction(actionType.action);
}



async function deleteFile (answers) {
    

    askAction(actionType.action);
}

async function logout () {
    await Client.logout();
}


function action (type, answers) {
    console.log('action数据：', type, answers);
    
    switch (type) {
        case actionType.defaultConnect:
            connect(answers);
            break;
        case actionType.connect:
            connect(answers);
            break;
        case actionType.ls:
            list(answers);
            break;
        case actionType.upload:
            upload(answers);
            break;
        case actionType.download:
            download(answers);
            break;
        case actionType.delete:
            deleteFile(answers);
            break;
        case actionType.logout:
            logout();
            break;
        case actionType.action:
            askActionF(answers.actionKey);
            break;
    }
}

let askActionF = async (type) => {
    let answers = {};
    if (promptListMapping.hasOwnProperty(type)) {
        answers  = await inquirer.prompt(promptListMapping[type])
    }

    console.log('当前获取到的答案是什么', answers, type);   
    action(type, answers);
};

async function askAction (type) {
    await askActionF(type);

    // if (type === actionType.action) {
    //     await askAction(type);
    //     return;
    // }



    // if (type === actionType.action) {
    //     answers  = await inquirer.prompt(promptListMapping[type])

    //     console.log('当前：', type, answers);
    //     action(type, answers);
    //     return;
    // }

    // action(type, answers);
}



module.exports = {
    askAction,
    actionType
}